# -*- coding: utf-8 -*-
"""Importe le classeur Excel du planning vers content/evenement.

Usage :
  python -X utf8 tools/import_xlsx.py            # simulation (aucune ecriture)
  python -X utf8 tools/import_xlsx.py --write    # cree les nouveaux fichiers

Regles :
  - une ligne dont la « Ref. site » correspond a un fichier existant est ignoree
    (aucune modification du contenu existant) ;
  - une ligne sans reference est un nouvel evenement : la reference est generee
    a partir de la date et du titre (meme convention que les fichiers du site) ;
  - les onglets Stages et Animations utilisent les memes regles.
"""
import argparse
import json
import re
import sys
import unicodedata
from datetime import date, datetime
from pathlib import Path

from openpyxl import load_workbook

SITE = Path(__file__).resolve().parents[1]
CONTENT = SITE / 'content' / 'evenement'
DEFAULT_XLSX = SITE.parent / 'planning-evenements.xlsx'

SHEETS = {
    'Régates': 'Régate',
    'Stages': 'Stage',
    'Animations': 'Animation',
}


def as_date(value):
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    if value in (None, ''):
        return None
    s = str(value).strip()
    for fmt in ('%d/%m/%Y', '%Y-%m-%d', '%d/%m/%y'):
        try:
            return datetime.strptime(s, fmt).date()
        except ValueError:
            pass
    raise ValueError(f'date illisible : {value!r}')


def slugify(text, maxlen=60):
    text = unicodedata.normalize('NFKD', str(text))
    text = ''.join(c for c in text if not unicodedata.combining(c))
    text = text.lower().replace("'", '').replace('’', '')
    text = re.sub(r'[^a-z0-9]+', '-', text).strip('-')
    return text[:maxlen].strip('-')


def classes(value):
    if value in (None, ''):
        return []
    return [c.strip() for c in str(value).split(',') if c.strip()]


def text(value):
    if value is None:
        return ''
    return str(value).strip()


def ref_for(row):
    ref = text(row.get('Réf. site') or row.get('Réf. série'))
    if ref:
        return ref
    start = as_date(row.get('Date début') or row.get('Date'))
    title = text(row.get('Titre'))
    if not start or not title:
        return None
    return f'{start.isoformat()}--{slugify(title)}'


def front_matter(values):
    lines = ['---']
    for key, value in values:
        if value is None or value == '' or value == []:
            continue
        if isinstance(value, bool):
            lines.append(f'{key}: {"true" if value else "false"}')
        elif isinstance(value, list):
            lines.append(f'{key}:')
            for item in value:
                lines.append(f'  - {json.dumps(item, ensure_ascii=False)}')
        elif isinstance(value, date):
            lines.append(f'{key}: {value.isoformat()}')
        else:
            lines.append(f'{key}: {json.dumps(str(value), ensure_ascii=False)}')
    lines.append('---')
    return '\n'.join(lines) + '\n'


def build_values(row, categorie):
    start = as_date(row.get('Date début'))
    end = as_date(row.get('Date fin'))
    dec = text(row.get('Déplacement (O/N)')).upper()
    heb = text(row.get('Hébergement (O/N)')).upper()
    values = [
        ('title', text(row.get('Titre'))),
        ('categorie', categorie),
    ]
    if categorie == 'Régate':
        values.append(('grade', text(row.get('Grade'))))
    if categorie == 'Stage':
        values.append(('lieu', text(row.get('Lieu'))))
    values += [
        ('classes', classes(row.get('Classes'))),
        ('startDate', start),
        ('allDay', True),
        ('endDate', end),
    ]
    if categorie == 'Régate':
        values += [
            ('clubOrganisateur', text(row.get('Club organisateur'))),
            ('deplacementClub', True if dec == 'O' else (False if dec == 'N' else None)),
            ('hebergementClub', True if heb == 'O' else (False if heb == 'N' else None)),
            ('coId', text(row.get('CO_ID'))),
            ('urlInscription', text(row.get('URL inscription'))),
            ('urlInfos', text(row.get('URL infos'))),
        ]
    return values


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('xlsx', nargs='?', default=str(DEFAULT_XLSX))
    ap.add_argument('--write', action='store_true', help='ecrire les fichiers')
    args = ap.parse_args()

    wb = load_workbook(args.xlsx, data_only=True)
    seen_paths = {p.stem for p in CONTENT.glob('*.md')}
    created = skipped = invalid = 0
    plan = []

    for sheet_name, categorie in SHEETS.items():
        if sheet_name not in wb.sheetnames:
            print(f'onglet absent : {sheet_name}')
            continue
        ws = wb[sheet_name]
        head = [c.value for c in ws[1]]
        for i, raw in enumerate(ws.iter_rows(min_row=2, values_only=True), start=2):
            if all(v in (None, '') for v in raw):
                continue
            row = dict(zip(head, raw))
            title = text(row.get('Titre'))
            try:
                start = as_date(row.get('Date début'))
            except ValueError as exc:
                print(f'  L{i} ignoree : {exc}')
                invalid += 1
                continue
            if not title or not start:
                print(f'  L{i} ignoree : titre ou date manquant')
                invalid += 1
                continue
            ref = ref_for(row)
            if not ref:
                print(f'  L{i} ignoree : reference impossible ({title})')
                invalid += 1
                continue

            base = ref
            n = 2
            while ref in seen_paths:
                existing = CONTENT / f'{ref}.md'
                if existing.exists() and sheet_name != 'Séances':
                    ref = base
                    break
                ref = f'{base}-{n}'
                n += 1
            if ref in seen_paths and (CONTENT / f'{ref}.md').exists():
                skipped += 1
                continue

            body = text(row.get('Description'))
            fm = front_matter(build_values(row, categorie))
            content = fm + (f'\n{body}\n' if body else '')
            plan.append((ref, content, sheet_name, i, title, start))
            seen_paths.add(ref)
            created += 1

    print(f'\nA creer : {created}   deja presents : {skipped}   invalides : {invalid}')
    by_year = {}
    for _, _, _, _, _, start in plan:
        by_year[start.year] = by_year.get(start.year, 0) + 1
    print('Par annee :', dict(sorted(by_year.items())))

    if not args.write:
        print('\nSimulation : aucun fichier ecrit (ajouter --write).')
        for ref, _, _, _, title, start in plan[:15]:
            print(f'  {start}  {ref}  ({title[:45]})')
        if len(plan) > 15:
            print(f'  ... et {len(plan) - 15} autres')
        return

    CONTENT.mkdir(parents=True, exist_ok=True)
    for ref, content, _, _, _, _ in plan:
        (CONTENT / f'{ref}.md').write_text(content, encoding='utf-8')
    print(f'\n{len(plan)} fichier(s) ecrit(s) dans {CONTENT}')


if __name__ == '__main__':
    main()

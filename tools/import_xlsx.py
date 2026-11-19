# -*- coding: utf-8 -*-
"""Importe le classeur du planning vers content/evenement en mode upsert.

Usage :
  python -X utf8 tools/import_xlsx.py [classeur.xlsx] [--write]

L'identité d'un événement est (startDate + titre normalisé). Les colonnes
techniques « Réf. site » / « Réf. série » sont ignorées si elles existent
encore, ce qui permet de les retirer du classeur sans créer de doublons.
Les champs non présents dans le classeur (ex. aliases) sont conservés.
"""
import argparse
import json
import re
import unicodedata
from datetime import date, datetime
from pathlib import Path

from openpyxl import load_workbook

SITE = Path(__file__).resolve().parents[1]
CONTENT = SITE / 'content' / 'evenement'
DEFAULT_XLSX = SITE.parent / 'planning-evenements.xlsx'
ALIASES_FILE = SITE / 'data' / 'evenements-alias.json'

SHEETS = {
    'Régates': 'Régate',
    'Stages': 'Stage',
    'Animations': 'Animation',
}
TECHNICAL_KEYS = ('Réf. site', 'Réf. série')


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


def norm_title(value):
    text = unicodedata.normalize('NFKD', str(value))
    text = ''.join(c for c in text if not unicodedata.combining(c)).lower()
    text = re.sub(r'\([^)]*\)', '', text)
    text = text.replace("'", '').replace('’', '')
    text = re.sub(r'[^a-z0-9]+', '-', text).strip('-')
    return text


def classes(value):
    if value in (None, ''):
        return []
    return [c.strip() for c in str(value).split(',') if c.strip()]


def text(value):
    if value is None:
        return ''
    return str(value).strip()


def render_value(value):
    if isinstance(value, bool):
        return 'true' if value else 'false'
    if isinstance(value, date):
        return value.isoformat()
    return json.dumps(str(value), ensure_ascii=False)


def render_lines(key, value):
    if isinstance(value, list):
        return [f'{key}:'] + [f'  - {json.dumps(str(v), ensure_ascii=False)}' for v in value]
    return [f'{key}: {render_value(value)}']


def front_matter(values):
    lines = ['---']
    for key, value in values:
        if value is None or value == '' or value == []:
            continue
        lines.extend(render_lines(key, value))
    lines.append('---')
    return '\n'.join(lines) + '\n'


def split_doc(content):
    lines = content.splitlines(keepends=True)
    if not lines or lines[0].strip() != '---':
        return [], '', content
    end = None
    for i, line in enumerate(lines[1:], start=1):
        if line.strip() == '---':
            end = i
            break
    if end is None:
        return [], '', content
    return lines[1:end], ''.join(lines[end + 1:]), lines[end]


def parse_fm(lines):
    order = []
    data = {}
    i = 0
    while i < len(lines):
        line = lines[i].rstrip('\n')
        match = re.match(r'^([A-Za-z0-9_-]+):\s*(.*)$', line)
        if not match:
            i += 1
            continue
        key, value = match.group(1), match.group(2).strip()
        if value == '':
            block = []
            i += 1
            while i < len(lines):
                sub = lines[i].rstrip('\n')
                if sub.startswith((' ', '\t')) or sub.strip() == '':
                    block.append(sub)
                    i += 1
                else:
                    break
            data[key] = ('block', block)
        else:
            data[key] = ('scalar', value)
            i += 1
        order.append(key)
    return order, data


def update_doc(path, values):
    fm_lines, body, delimiter = split_doc(path.read_text(encoding='utf-8'))
    order, data = parse_fm(fm_lines)
    keys = [key for key, _ in values]
    fresh = {key: value for key, value in values if value not in (None, '', [])}
    out = []
    for key in order:
        if key in keys:
            if key in fresh:
                out.extend(render_lines(key, fresh[key]))
            continue
        kind, payload = data[key]
        if kind == 'block':
            out.append(f'{key}:')
            out.extend(payload)
        else:
            out.append(f'{key}: {payload}')
    for key in keys:
        if key not in order and key in fresh:
            out.extend(render_lines(key, fresh[key]))
    return '---\n' + '\n'.join(out) + '\n' + delimiter.lstrip('\n') + body


def load_aliases():
    if not ALIASES_FILE.exists():
        return {}
    return json.loads(ALIASES_FILE.read_text(encoding='utf-8'))


def build_values(row, categorie, ref):
    start = as_date(row.get('Date début'))
    end = as_date(row.get('Date fin'))
    dec = text(row.get('Déplacement (O/N)')).upper()
    heb = text(row.get('Hébergement (O/N)')).upper()
    title = text(row.get('Titre'))
    values = [
        ('title', title),
        ('categorie', categorie),
    ]
    if categorie == 'Régate':
        values.append(('grade', text(row.get('Grade'))))
    if categorie == 'Stage':
        slug = slugify(title) or ref
        values += [
            ('url', f'/stages/{slug}/'),
            ('lieu', text(row.get('Lieu'))),
            ('typeStage', text(row.get('Type'))),
        ]
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
    aliases = load_aliases()
    index = {}
    for path in CONTENT.glob('*.md'):
        fm_lines, _, _ = split_doc(path.read_text(encoding='utf-8'))
        _, data = parse_fm(fm_lines)
        start = data.get('startDate', ('scalar', ''))[1]
        title = data.get('title', ('scalar', ''))[1].strip().strip('"')
        if start and title:
            index[(str(start)[:10], norm_title(title))] = path.stem

    created = updated = invalid = 0
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
            for key in TECHNICAL_KEYS:
                row.pop(key, None)
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

            ref = f'{start.isoformat()}--{slugify(title)}'
            key = (start.isoformat(), norm_title(title))
            stem = ref if (CONTENT / f'{ref}.md').exists() else None
            if not stem:
                stem = aliases.get(f'{key[0]}|{key[1]}')
            if not stem:
                stem = index.get(key)

            values = build_values(row, categorie, ref)
            if stem:
                path = CONTENT / f'{stem}.md'
                content = update_doc(path, values)
                action = 'MAJ'
                updated += 1
            else:
                base = ref
                n = 2
                while (CONTENT / f'{ref}.md').exists():
                    ref = f'{base}-{n}'
                    n += 1
                path = CONTENT / f'{ref}.md'
                body = text(row.get('Description'))
                content = front_matter(values) + (f'\n{body}\n' if body else '')
                action = 'NEW'
                created += 1
                index[key] = path.stem

            plan.append((action, path.name, content, sheet_name, i, title, start))

    print(f'\nA creer : {created}   a mettre a jour : {updated}   invalides : {invalid}')
    if not args.write:
        print('\nSimulation : aucun fichier ecrit (ajouter --write).')
        for action, name, _, _, _, title, start in plan[:15]:
            print(f'  {action} {start}  {name}  ({title[:45]})')
        if len(plan) > 15:
            print(f'  ... et {len(plan) - 15} autres')
        return

    for _, name, content, _, _, _, _ in plan:
        (CONTENT / name).write_text(content, encoding='utf-8')
    print(f'\n{len(plan)} fichier(s) ecrit(s) dans {CONTENT}')


if __name__ == '__main__':
    main()

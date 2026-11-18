# -*- coding: utf-8 -*-
"""Exporte les evenements du site vers un classeur xlsx (graine du Google Sheet).

Un onglet par type (Regates, Stages, Animations, Seances) + onglet Notice.
Colonnes specifiques aux regates : CO_ID (FFV), URL d'inscription, URL d'infos.
Usage : python -X utf8 tools/export_xlsx.py [chemin_de_sortie.xlsx]
"""
import re
import sys
from datetime import datetime
from pathlib import Path

import yaml
from openpyxl import Workbook
from openpyxl.comments import Comment
from openpyxl.styles import Alignment, Font, PatternFill, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

SITE = Path(__file__).resolve().parents[1]
CONTENT = SITE / 'content' / 'evenement'
DEFAULT_OUT = SITE.parent / 'planning-evenements.xlsx'

REF_HINT = ("Laisser VIDE pour un nouvel événement ; ne pas modifier "
            "sur une ligne existante (identifiant technique).")

# Valeurs deja connues (a completer dans le Google Sheet par la suite)
SEED_CO_ID = {
    '2026-11-21--cich-poses-cdv27': '1003175',
}
SEED_URL_INSCRIPTION = {
    '2026-11-27--l-ultime-xii': 'https://inscrivoile.fr/inscrits.php?id_regate=303530',
}


def read_event(path):
    raw = path.read_text(encoding='utf-8-sig')
    m = re.match(r'^---\s*\n(.*?)\n---\s*\n?(.*)$', raw, re.S)
    if not m:
        return None
    data = yaml.safe_load(m.group(1)) or {}
    data['_body'] = m.group(2).strip()
    data['_ref'] = path.stem
    return data


def as_date(value):
    if not value:
        return None
    if isinstance(value, datetime):
        return value.date()
    return datetime.strptime(str(value)[:10], '%Y-%m-%d').date()


def classes(data):
    c = data.get('classes') or []
    if isinstance(c, str):
        c = [c]
    return ', '.join(c)


def description(data):
    return data.get('summary') or data.get('_body') or ''


def main():
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_OUT
    events = []
    for p in sorted(CONTENT.glob('*.md')):
        if p.name.startswith('_'):
            continue
        ev = read_event(p)
        if ev and ev.get('categorie'):
            events.append(ev)

    regates = [e for e in events if e['categorie'] == 'Régate']
    stages = [e for e in events if e['categorie'] == 'Stage']
    anims = [e for e in events if e['categorie'] == 'Animation' and not e.get('dates')]
    series = [e for e in events if e['categorie'] == 'Animation' and e.get('dates')]

    wb = Workbook()
    wb.remove(wb.active)

    head_fill = PatternFill('solid', fgColor='0B3A5D')
    head_font = Font(bold=True, color='FFFFFF')
    thin = Side(style='thin', color='D9D9D9')
    border = Border(left=thin, right=thin, top=thin, bottom=thin)
    date_fmt = 'DD/MM/YYYY'

    def sheet(title, columns, widths):
        ws = wb.create_sheet(title)
        ws.append(columns)
        for i, (name, width) in enumerate(zip(columns, widths), 1):
            c = ws.cell(row=1, column=i)
            c.fill = head_fill
            c.font = head_font
            c.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
            ws.column_dimensions[get_column_letter(i)].width = width
        ws.freeze_panes = 'A2'
        ws.row_dimensions[1].height = 30
        ws['A1'].comment = Comment(REF_HINT, 'YCR76', width=260, height=90)
        return ws

    def finish(ws, ncols, nrows):
        last_col = get_column_letter(ncols)
        if nrows:
            ws.auto_filter.ref = f'A1:{last_col}{nrows + 1}'
        for row in ws.iter_rows(min_row=2, max_row=nrows + 1, max_col=ncols):
            for c in row:
                c.border = border

    # ---------------- Regates ----------------
    cols = ['Réf. site', 'Date début', 'Date fin', 'Titre', 'Grade',
            'Classes', 'Club organisateur', 'Déplacement (O/N)', 'Hébergement (O/N)',
            'CO_ID', 'URL inscription', 'URL infos', 'Description']
    widths = [34, 13, 13, 46, 8, 34, 20, 15, 16, 12, 52, 40, 40]
    ws = sheet('Régates', cols, widths)
    for r, e in enumerate(regates, 2):
        ws.cell(row=r, column=1, value=e['_ref'])
        ws.cell(row=r, column=2, value=as_date(e.get('startDate')))
        ws.cell(row=r, column=3, value=as_date(e.get('endDate')))
        ws.cell(row=r, column=4, value=e.get('title'))
        ws.cell(row=r, column=5, value=e.get('grade'))
        ws.cell(row=r, column=6, value=classes(e))
        ws.cell(row=r, column=7, value=e.get('clubOrganisateur') or '')
        ws.cell(row=r, column=8, value='O' if e.get('deplacementClub') else ('N' if e.get('deplacementClub') is False else ''))
        ws.cell(row=r, column=9, value='O' if e.get('hebergementClub') else ('N' if e.get('hebergementClub') is False else ''))
        ws.cell(row=r, column=10, value=str(e.get('coId') or SEED_CO_ID.get(e['_ref'], '')))
        ws.cell(row=r, column=11, value=e.get('urlInscription') or SEED_URL_INSCRIPTION.get(e['_ref'], ''))
        ws.cell(row=r, column=12, value=e.get('urlInfos') or '')
        ws.cell(row=r, column=13, value=description(e))
        for col in (2, 3):
            ws.cell(row=r, column=col).number_format = date_fmt
        ws.cell(row=r, column=5).alignment = Alignment(horizontal='center')
        ws.cell(row=r, column=10).number_format = '@'
    finish(ws, len(cols), len(regates))
    last = len(regates) + 1
    dv_grade = DataValidation(type='list', formula1='"5C,5B,5A,4,3,2"', allow_blank=True,
                              showErrorMessage=True, errorTitle='Grade',
                              error='Valeurs autorisees : 5C, 5B, 5A, 4, 3, 2')
    dv_on = DataValidation(type='list', formula1='"O,N"', allow_blank=True,
                           showErrorMessage=True, errorTitle='O/N',
                           error='Saisir O (oui) ou N (non)')
    ws.add_data_validation(dv_grade)
    ws.add_data_validation(dv_on)
    dv_grade.add(f'E2:E{max(last, 2)}')
    dv_on.add(f'H2:I{max(last, 2)}')

    # ---------------- Stages ----------------
    cols = ['Réf. site', 'Date début', 'Date fin', 'Titre', 'Lieu', 'Classes', 'Description']
    widths = [34, 13, 13, 52, 26, 34, 44]
    ws = sheet('Stages', cols, widths)
    for r, e in enumerate(stages, 2):
        ws.cell(row=r, column=1, value=e['_ref'])
        ws.cell(row=r, column=2, value=as_date(e.get('startDate')))
        ws.cell(row=r, column=3, value=as_date(e.get('endDate')))
        ws.cell(row=r, column=4, value=e.get('title'))
        ws.cell(row=r, column=5, value=e.get('lieu') or '')
        ws.cell(row=r, column=6, value=classes(e))
        ws.cell(row=r, column=7, value=description(e))
        for col in (2, 3):
            ws.cell(row=r, column=col).number_format = date_fmt
    finish(ws, len(cols), len(stages))

    # ---------------- Animations ----------------
    cols = ['Réf. site', 'Date début', 'Date fin', 'Titre', 'Description']
    widths = [34, 13, 13, 52, 44]
    ws = sheet('Animations', cols, widths)
    for r, e in enumerate(anims, 2):
        ws.cell(row=r, column=1, value=e['_ref'])
        ws.cell(row=r, column=2, value=as_date(e.get('startDate')))
        ws.cell(row=r, column=3, value=as_date(e.get('endDate')))
        ws.cell(row=r, column=4, value=e.get('title'))
        ws.cell(row=r, column=5, value=description(e))
        for col in (2, 3):
            ws.cell(row=r, column=col).number_format = date_fmt
    finish(ws, len(cols), len(anims))

    # ---------------- Seances (series) ----------------
    cols = ['Réf. série', 'Titre', 'Date', 'Classes', 'Description']
    widths = [34, 46, 13, 38, 40]
    ws = sheet('Séances', cols, widths)
    r = 2
    for e in series:
        for d in e.get('dates') or []:
            ws.cell(row=r, column=1, value=e['_ref'])
            ws.cell(row=r, column=2, value=e.get('title'))
            ws.cell(row=r, column=3, value=as_date(d))
            ws.cell(row=r, column=4, value=classes(e))
            ws.cell(row=r, column=5, value=description(e))
            ws.cell(row=r, column=3).number_format = date_fmt
            r += 1
    n_series_rows = r - 2
    finish(ws, len(cols), n_series_rows)

    # ---------------- Notice ----------------
    ws = wb.create_sheet('Notice')
    ws.column_dimensions['A'].width = 120
    notes = [
        'Classeur source du planning du YCR76 — un onglet par type d’événement.',
        '',
        'Dates : JJ/MM/AAAA. Laisser la date de fin vide pour un événement d’un seul jour.',
        'Classes : séparer par des virgules (ex. : ILCA/Laser, Europe).',
        'Déplacement / Hébergement : O (oui) ou N (non).',
        '',
        'CO_ID : identifiant FFVoile de la compétition. Le site crée automatiquement le lien',
        '   https://regates.ffvoile.fr/competitions/<CO_ID>/  sur la page de la régate.',
        'URL inscription : lien Inscrivoile de la régate (ex. https://inscrivoile.fr/inscrits.php?id_regate=…).',
        'URL infos : lien libre (site du club organisateur, avis de course, etc.).',
        'Lieu : utilisé pour les stages (visible sur la page de l’événement).',
        '',
        'Réf. site : laisser VIDE pour un nouvel événement. Ne pas modifier sur une ligne',
        '   existante (identifiant technique utilisé par la synchronisation du site).',
        'Une ligne = un événement (une date par ligne dans l’onglet Séances).',
        'Les ajouts, modifications et suppressions sont publiés automatiquement chaque matin.',
        '',
        'Ne pas renommer ni supprimer les onglets.',
    ]
    for i, text in enumerate(notes, 1):
        c = ws.cell(row=i, column=1, value=text)
        if i == 1:
            c.font = Font(bold=True, size=13)
        c.alignment = Alignment(wrap_text=True)

    out.parent.mkdir(parents=True, exist_ok=True)
    wb.save(out)

    print(f'Fichier ecrit : {out}')
    print(f'  Regates      : {len(regates)}')
    print(f'  Stages       : {len(stages)}')
    print(f'  Animations   : {len(anims)}')
    print(f'  Series       : {len(series)} ({n_series_rows} seances)')

    dup = {}
    for e in events:
        key = (str(e.get('startDate')), e.get('title'))
        dup.setdefault(key, []).append(e['_ref'])
    doubles = {k: v for k, v in dup.items() if len(v) > 1}
    if doubles:
        print('\nA verifier (meme date et meme titre) :')
        for (d, t), refs in sorted(doubles.items()):
            print(f'  {d} {t} -> {refs}')

    seeds = [r for r in SEED_CO_ID if r in {e['_ref'] for e in events}]
    print(f'\nCO_ID pre-remplis : {len(seeds)}')
    print(f'URL inscription pre-remplies : {len(SEED_URL_INSCRIPTION)}')


if __name__ == '__main__':
    main()

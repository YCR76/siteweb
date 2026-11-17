# -*- coding: utf-8 -*-
"""Synchronise la galerie Synology Photos du NAS vers les données Hugo.

Usage: python -X utf8 tools/sync_photos.py [--base https://nas.ycr76.fr:5001]

- Explore l'arborescence partagée /PHOTOS CLASSEES PAR ANNEES (accès anonyme,
  invité activé sur le NAS).
- Écrit data/photos/index.json (années + volumes) et data/photos/<année>.json
  (dossiers + items avec cache_key de miniature).
- Ne télécharge aucune image : le site hotlinke les miniatures du NAS.
"""
import json
import re
import ssl
import sys
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path

BASE = 'https://nas.ycr76.fr:5001/webapi/entry.cgi'
ROOT_NAME = 'PHOTOS CLASSEES PAR ANNEES'

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE


def call(api, method, params, version=1):
    url = f'{BASE}?api={api}&version={version}&method={method}' + params
    data = json.load(urllib.request.urlopen(url, timeout=60, context=ctx))
    if not data.get('success'):
        raise RuntimeError(f'{api}.{method}: {data.get("error")}')
    return data.get('data') or {}


def paged(params, version=1):
    out, offset = [], 0
    while True:
        chunk = call('SYNO.FotoTeam.Browse.Folder', 'list',
                     f'{params}&offset={offset}&limit=500', version).get('list', [])
        out += chunk
        if len(chunk) < 500:
            return out
        offset += 500


def items_in(folder_id):
    out, offset = [], 0
    while True:
        url = (f'{BASE}?api=SYNO.FotoTeam.Browse.Item&version=7&method=list'
               f'&folder_id={folder_id}&offset={offset}&limit=500'
               '&additional=' + urllib.parse.quote('["thumbnail","resolution"]'))
        data = json.load(urllib.request.urlopen(url, timeout=60, context=ctx))
        if not data.get('success'):
            raise RuntimeError(f'items {folder_id}: {data.get("error")}')
        lst = data.get('data', {}).get('list', [])
        out += lst
        if len(lst) < 500:
            return out
        offset += 500


def slugify(text):
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode()
    text = text.lower()
    slug = re.sub(r'[ _\'’\.\(\)«»"=,;&/\[\]]+', '-', text)
    slug = re.sub(r'[^a-z0-9-]', '', slug)
    slug = re.sub(r'-+', '-', slug).strip('-')
    return slug or 'album'


def compact_item(it):
    thumb = (it.get('additional') or {}).get('thumbnail') or {}
    if thumb.get('sm') != 'ready' and thumb.get('m') != 'ready':
        return None
    res = (it.get('additional') or {}).get('resolution') or {}
    return {
        'id': it['id'],
        'ck': thumb.get('cache_key'),
        'w': res.get('width'),
        'h': res.get('height'),
        'n': it.get('filename'),
        't': it.get('time'),
        'v': it.get('type') == 'video',
    }


def main():
    root_folders = call('SYNO.FotoTeam.Browse.Folder', 'list', '&limit=100&offset=0&id=1').get('list', [])
    root = next((f for f in root_folders if ROOT_NAME.lower() in f['name'].lower()), None)
    if root is None:
        sys.exit(f'dossier {ROOT_NAME!r} introuvable')

    years = paged(f'&id={root["id"]}')
    years.sort(key=lambda f: f['name'])
    out_dir = Path(__file__).resolve().parent.parent / 'data' / 'photos'
    out_dir.mkdir(parents=True, exist_ok=True)

    index = {'years': [], 'base': BASE}
    year_pages = {}
    for year_folder in years:
        year = year_folder['name'].split('/')[-1]
        match = re.search(r'\d{4}', year)
        if not match:
            print(f'ignoré (pas d\'année): {year_folder["name"]}')
            continue
        year = int(match.group())
        folders = []
        used_slugs = {}
        for sub in paged(f'&id={year_folder["id"]}'):
            name = sub['name'].split('/')[-1]
            it_all = items_in(sub['id'])
            compact = [c for c in map(compact_item, it_all) if c]
            if not compact:
                continue
            slug = slugify(name)
            if slug in used_slugs:
                used_slugs[slug] += 1
                slug = f'{slug}-{used_slugs[slug]}'
            else:
                used_slugs[slug] = 1
            compact.sort(key=lambda c: c['t'] or 0)
            folders.append({'id': sub['id'], 'name': name, 'slug': slug, 'items': compact})
        folders.sort(key=lambda f: f['name'].lower())
        (out_dir / f'{year}.json').write_text(
            json.dumps({'year': year, 'folderId': year_folder['id'], 'folders': folders},
                       ensure_ascii=False), encoding='utf-8')
        count = sum(len(f['items']) for f in folders)
        videos = sum(1 for f in folders for c in f['items'] if c['v'])
        index['years'].append({'year': year, 'folders': len(folders), 'photos': count})
        print(f'{year}: {len(folders)} dossiers, {count} photos')
        year_pages[year] = [(f['name'], f['slug'], f['id']) for f in folders]

    index['years'].sort(key=lambda y: -y['year'])
    (out_dir / 'index.json').write_text(json.dumps(index, ensure_ascii=False), encoding='utf-8')
    total = sum(y['photos'] for y in index['years'])
    print(f'TOTAL: {total} photos, {len(index["years"])} années')
    write_content(year_pages)


def write_content(year_pages):
    """Écrit les pages Hugo content/photos/ (_index + année + albums)."""
    content_dir = Path(__file__).resolve().parent.parent / 'content' / 'photos'
    if content_dir.exists():
        import shutil
        shutil.rmtree(content_dir)
    (content_dir / '_index.md').write_text(
        '---\n'
        'title: "Archives photo"\n'
        'summary: "13 000 photos du club depuis 1989, classées par année, '
        'provenant de la photothèque du NAS (Synology Photos)."\n'
        '---\n', encoding='utf-8')
    for year, folders in sorted(year_pages.items(), reverse=True):
        ydir = content_dir / str(year)
        (ydir / '_index.md').write_text(
            f'---\ntitle: "{year}"\nyear: {year}\nsummary: "{len(folders)} albums"\n---\n',
            encoding='utf-8')
        for name, slug, folder_id in folders:
            title = name.replace('"', '\\"')
            (ydir / slug / 'index.md').write_text(
                '---\n'
                f'title: "{title}"\n'
                f'year: {year}\n'
                f'folderId: {folder_id}\n'
                '---\n', encoding='utf-8')
    print(f'contenu écrit: {content_dir}')


if __name__ == '__main__':
    main()

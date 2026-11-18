# -*- coding: utf-8 -*-
"""Deploie public/ vers l'hebergement OVH en SFTP.

Variables d'environnement requises :
  OVH_SFTP_HOST, OVH_SFTP_USER, OVH_SFTP_PASSWORD, OVH_SFTP_DIR

Exemples :
  python -X utf8 tools/deploy_sftp.py --probe
  python -X utf8 tools/deploy_sftp.py
  python -X utf8 tools/deploy_sftp.py --delete
"""
import argparse
import os
import posixpath
import sys
import time
from pathlib import Path

import paramiko

LOCAL = Path(__file__).resolve().parents[1] / 'public'


def env(name):
    value = os.environ.get(name)
    if not value:
        sys.exit(f'variable manquante : {name}')
    return value


def connect():
    host, user = env('OVH_SFTP_HOST'), env('OVH_SFTP_USER')
    password, port = env('OVH_SFTP_PASSWORD'), int(os.environ.get('OVH_SFTP_PORT', '22'))
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, port=port, username=user, password=password,
                   timeout=30, banner_timeout=30, auth_timeout=30, look_for_keys=False,
                   allow_agent=False)
    return client, client.open_sftp()


def ensure_dir(sftp, path):
    parts = [p for p in path.split('/') if p]
    cur = ''
    for part in parts:
        cur += '/' + part
        try:
            sftp.stat(cur)
        except FileNotFoundError:
            sftp.mkdir(cur)


def remote_files(sftp, base):
    found = {}
    stack = ['']
    while stack:
        rel = stack.pop()
        try:
            entries = sftp.listdir_attr(posixpath.join(base, rel))
        except FileNotFoundError:
            continue
        for entry in entries:
            child = posixpath.join(rel, entry.filename)
            if entry.st_mode & 0o040000:
                stack.append(child)
            else:
                found[child.lstrip('/')] = entry
    return found


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--local', default=str(LOCAL))
    ap.add_argument('--probe', action='store_true')
    ap.add_argument('--delete', action='store_true', help='supprimer les fichiers distants absents en local')
    args = ap.parse_args()

    local = Path(args.local)
    if not local.is_dir():
        sys.exit(f'dossier local introuvable : {local}')

    base = '/' + env('OVH_SFTP_DIR').strip('/')
    client, sftp = connect()
    try:
        sftp.chdir('/')
        if args.probe:
            print(f'connexion OK, dossier distant {base} :')
            try:
                for name in sorted(sftp.listdir(base))[:50]:
                    print('  ', name)
            except FileNotFoundError:
                print('  (inexistant)')
            return

        files = sorted(p for p in local.rglob('*') if p.is_file())
        remote = remote_files(sftp, base)
        ensure_dir(sftp, base)

        uploaded = skipped = 0
        total = 0
        started = time.time()
        for path in files:
            rel = path.relative_to(local).as_posix()
            rpath = posixpath.join(base, rel)
            rdir = posixpath.dirname(rpath)
            ensure_dir(sftp, rdir)
            size = path.stat().st_size
            old = remote.get(rel)
            if old and old.st_size == size:
                skipped += 1
                continue
            sftp.put(str(path), rpath)
            try:
                sftp.utime(rpath, (path.stat().st_atime, path.stat().st_mtime))
            except OSError:
                pass
            uploaded += 1
            total += size
            if uploaded % 100 == 0:
                print(f'  {uploaded} envoyes... ({total / 1048576:.1f} Mo)', flush=True)

        deleted = 0
        if args.delete:
            for rel in sorted(remote, reverse=True):
                if rel not in {p.relative_to(local).as_posix() for p in files}:
                    try:
                        sftp.remove(posixpath.join(base, rel))
                        deleted += 1
                    except OSError:
                        pass
            # dossiers vides
            for rel in sorted({posixpath.dirname(r) for r in remote}, key=len, reverse=True):
                try:
                    sftp.rmdir(posixpath.join(base, rel))
                except OSError:
                    pass

        dur = time.time() - started
        print(f'\n{uploaded} fichier(s) envoye(s) ({total / 1048576:.1f} Mo), '
              f'{skipped} inchange(s), {deleted} supprime(s) en {dur:.0f} s')
        print(f'-> https://dev.ycr76.fr/')
    finally:
        sftp.close()
        client.close()


if __name__ == '__main__':
    main()

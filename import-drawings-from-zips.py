#!/usr/bin/env python3
"""Extract drawing files from source ZIP archives into the clean paths used by the site.

Usage from repository root:
  python scripts/import-drawings-from-zips.py /path/to/folder/with/source-zips

The folder should contain the archives named in data/drawings.generated.json, e.g.:
  PGW - Rysunki-20260604T095309Z-3-001.zip
  PGW - Rysunki-20260604T095309Z-3-002.zip
  Rysunki wybuchowe-Robocze-20260604T094743Z-3-001.zip
"""
import json, sys, zipfile, shutil
from pathlib import Path

ROOT = Path.cwd()
MANIFEST = ROOT / 'data' / 'drawings.generated.json'
if len(sys.argv) < 2:
    print('Podaj folder z archiwami ZIP.', file=sys.stderr)
    sys.exit(2)
SRC = Path(sys.argv[1])
if not MANIFEST.exists():
    print(f'Brak manifestu: {MANIFEST}', file=sys.stderr)
    sys.exit(2)

drawings = json.loads(MANIFEST.read_text(encoding='utf-8'))
by_archive = {}
for item in drawings:
    by_archive.setdefault(item.get('sourceArchive'), []).append(item)

copied = missing = 0
for archive_name, items in by_archive.items():
    zpath = SRC / archive_name
    if not zpath.exists():
        print(f'BRAK ARCHIWUM: {zpath}')
        missing += len(items)
        continue
    print(f'Czytam {zpath.name} — {len(items)} plików')
    with zipfile.ZipFile(zpath) as z:
        names = set(z.namelist())
        for item in items:
            original = item.get('originalPath')
            target = ROOT / item.get('path','')
            if not original or not target.name:
                missing += 1; continue
            if original not in names:
                print(f'  brak w zip: {original}')
                missing += 1; continue
            target.parent.mkdir(parents=True, exist_ok=True)
            with z.open(original) as src, open(target, 'wb') as dst:
                shutil.copyfileobj(src, dst)
            copied += 1
print(f'Gotowe. Skopiowano: {copied}, brakujące: {missing}')

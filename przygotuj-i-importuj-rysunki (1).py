#!/usr/bin/env python3
"""Importer rysunków PGW dla Macieja.

Działa z dwoma wariantami źródeł:
1. folder zawiera gotowe archiwa:
   - PGW - Rysunki-20260604T095309Z-3-001.zip
   - PGW - Rysunki-20260604T095309Z-3-002.zip
   - Rysunki wybuchowe-Robocze-20260604T094743Z-3-001.zip
2. folder zawiera wieloczęściowe ezyZip.z01, ezyZip.z02 ... ezyZip.zip.

Uruchom z katalogu repozytorium:
python3 scripts/przygotuj-i-importuj-rysunki.py "/ścieżka/do/folderu/z/archiwami"
"""
import json
import shutil
import sys
import zipfile
from pathlib import Path

ROOT = Path.cwd()
MANIFEST = ROOT / 'data' / 'drawings.generated.json'
REQUIRED = [
    'PGW - Rysunki-20260604T095309Z-3-001.zip',
    'PGW - Rysunki-20260604T095309Z-3-002.zip',
    'Rysunki wybuchowe-Robocze-20260604T094743Z-3-001.zip',
]


def fail(msg):
    print(msg, file=sys.stderr)
    sys.exit(2)


def ensure_archives(src: Path) -> Path:
    if all((src / name).exists() for name in REQUIRED):
        return src

    split_parts = sorted(src.glob('ezyZip.z[0-9][0-9]'))
    last_part = src / 'ezyZip.zip'
    if not split_parts or not last_part.exists():
        missing = [name for name in REQUIRED if not (src / name).exists()]
        fail('Brakuje archiwów źródłowych: ' + ', '.join(missing))

    work = src / '_pgw_import_work'
    work.mkdir(exist_ok=True)
    combined = work / 'ezyZip_full.zip'

    if not combined.exists():
        print('Składam wieloczęściowe archiwum ezyZip...')
        with open(combined, 'wb') as out:
            for part in split_parts + [last_part]:
                print('  +', part.name)
                with open(part, 'rb') as inp:
                    shutil.copyfileobj(inp, out, length=1024 * 1024 * 16)
    else:
        print('Używam istniejącego:', combined)

    print('Wypakowuję wewnętrzne archiwa z ezyZip_full.zip...')
    with zipfile.ZipFile(combined) as z:
        names = z.namelist()
        for req in REQUIRED:
            target = work / req
            if target.exists():
                continue
            match = next((n for n in names if Path(n).name == req), None)
            if not match:
                fail(f'Nie znalazłem w ezyZip_full.zip: {req}')
            print('  ->', req)
            with z.open(match) as src_file, open(target, 'wb') as dst:
                shutil.copyfileobj(src_file, dst, length=1024 * 1024 * 16)
    return work


def import_drawings(src: Path):
    if not MANIFEST.exists():
        fail(f'Brak manifestu: {MANIFEST}')

    drawings = json.loads(MANIFEST.read_text(encoding='utf-8'))
    by_archive = {}
    for item in drawings:
        by_archive.setdefault(item.get('sourceArchive'), []).append(item)

    copied = missing = skipped = 0
    for archive_name, items in by_archive.items():
        zpath = src / archive_name
        if not zpath.exists():
            print(f'BRAK ARCHIWUM: {zpath}')
            missing += len(items)
            continue
        print(f'Czytam {zpath.name} — {len(items)} plików')
        with zipfile.ZipFile(zpath) as z:
            names = set(z.namelist())
            for item in items:
                original = item.get('originalPath')
                target_rel = item.get('path', '')
                target = ROOT / target_rel
                if not original or not target.name:
                    missing += 1
                    continue
                if target.exists() and target.stat().st_size == int(item.get('size') or 0):
                    skipped += 1
                    continue
                if original not in names:
                    print(f'  brak w zip: {original}')
                    missing += 1
                    continue
                target.parent.mkdir(parents=True, exist_ok=True)
                with z.open(original) as src_file, open(target, 'wb') as dst:
                    shutil.copyfileobj(src_file, dst, length=1024 * 1024 * 4)
                copied += 1
    print(f'Gotowe. Skopiowano: {copied}, pominięto istniejące: {skipped}, brakujące: {missing}')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        fail('Podaj folder z archiwami ZIP albo ezyZip.z01...')
    source = Path(sys.argv[1]).expanduser().resolve()
    if not source.exists():
        fail(f'Folder nie istnieje: {source}')
    archive_folder = ensure_archives(source)
    import_drawings(archive_folder)

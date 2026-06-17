#!/usr/bin/env python3
"""PGW v51 — konwersja eksportu CSV z arkusza drive-drawings-map do JSON.

Użycie:
  python3 scripts/convert-drive-manifest-csv.py manifest.csv data/drive-drawings-map.full.json

CSV powinien mieć nagłówki z Apps Script: fileId,title,fileName,model,deviceIndex,brand,...
"""
import csv, json, sys
from pathlib import Path

if len(sys.argv) < 3:
    print(__doc__)
    raise SystemExit(2)

src = Path(sys.argv[1])
out = Path(sys.argv[2])
rows = []
seen = set()
with src.open('r', encoding='utf-8-sig', newline='') as f:
    reader = csv.DictReader(f)
    for row in reader:
        file_id = (row.get('fileId') or '').strip()
        if not file_id or file_id in seen:
            continue
        seen.add(file_id)
        row['type'] = 'pdf'
        row['mimeType'] = row.get('mimeType') or 'application/pdf'
        keys = [row.get('deviceIndex'), row.get('model'), row.get('normalizedKey'), row.get('fileName'), row.get('title')]
        row['keys'] = [x for x in keys if x]
        rows.append(row)

rows.sort(key=lambda r: ((r.get('brand') or ''), (r.get('deviceIndex') or ''), (r.get('title') or '')))
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'Zapisano {len(rows)} rekordów do {out}')

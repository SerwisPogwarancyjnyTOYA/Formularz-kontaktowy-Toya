#!/usr/bin/env python3
"""Tworzy szablon mapowania pozycji dla PDF.

Uruchom w katalogu repo:
  python3 scripts/build-part-map-template.py data/parts.json data/part-map-template.csv

CSV można potem uzupełnić ręcznie o x/y/r dla najczęstszych modeli.
"""
import csv, json, sys
from pathlib import Path

src = Path(sys.argv[1] if len(sys.argv) > 1 else 'data/parts.json')
out = Path(sys.argv[2] if len(sys.argv) > 2 else 'data/part-map-template.csv')
parts = json.loads(src.read_text(encoding='utf-8'))
seen = set()
rows = []
for p in parts:
    key = (p.get('deviceIndex',''), p.get('drawingId',''), str(p.get('position','')))
    if not key[0] or not key[1] or not key[2] or key in seen:
        continue
    seen.add(key)
    rows.append({
        'deviceIndex': key[0],
        'drawingId': key[1],
        'position': key[2],
        'partIndex': p.get('partIndex',''),
        'name': p.get('namePl') or p.get('nameEn') or '',
        'page': 1,
        'x': '', 'y': '', 'r': ''
    })
out.parent.mkdir(parents=True, exist_ok=True)
with out.open('w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=['deviceIndex','drawingId','position','partIndex','name','page','x','y','r'])
    w.writeheader(); w.writerows(rows)
print(f'Zapisano {len(rows)} pozycji do {out}')

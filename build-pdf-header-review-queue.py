#!/usr/bin/env python3
"""Build queue for PDF header extraction from full manifest.

Prioritizes entries without reliable display names and low-confidence brand guesses.
"""
from __future__ import annotations
import json, csv
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data'
manifest = json.loads((DATA / 'drive-drawings-map.full.json').read_text(encoding='utf-8'))
items = manifest.get('items', [])
queue = []
for item in items:
    brand = str(item.get('brand') or '').upper()
    conf = str(item.get('guessConfidence') or item.get('brandConfidence') or item.get('confidence') or '').lower()
    title = str(item.get('title') or item.get('fileName') or '')
    model = str(item.get('normalizedModel') or item.get('model') or '')
    display = item.get('displayTitle') or item.get('deviceName') or ''
    only_number_title = title.lower().startswith('czesci_zamienne_') and model and model.isdigit()
    if brand in {'DO ROZPOZNANIA', 'NIEZNANA', ''} or conf in {'low','medium'} or only_number_title or not display:
        queue.append({
            'fileId': item.get('fileId'),
            'model': model,
            'title': title,
            'brand': item.get('brand'),
            'previewUrl': item.get('previewUrl'),
            'viewerUrl': item.get('viewerUrl'),
            'reason': 'unknown brand / numeric filename / missing device name'
        })

out = {'generatedAt': manifest.get('generatedAt'), 'count': len(queue), 'items': queue}
(DATA / 'pdf-header-extraction-queue.json').write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding='utf-8')
with (DATA / 'pdf-header-extraction-queue.csv').open('w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['fileId','model','title','brand','previewUrl','viewerUrl','reason'])
    writer.writeheader(); writer.writerows(queue)
print(f'Queue: {len(queue)}')

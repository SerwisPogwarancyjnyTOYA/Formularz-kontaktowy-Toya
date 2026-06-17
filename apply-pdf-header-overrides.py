#!/usr/bin/env python3
"""Apply PDF header overrides to Drive manifest and create user-facing device names.

Input:
  data/drive-drawings-map.full.json
  data/pdf-header-overrides.json
Output:
  data/drive-drawings-map.enriched.json
  data/device-names-from-pdf-headers.json
"""
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data'
manifest_path = DATA / 'drive-drawings-map.full.json'
overrides_path = DATA / 'pdf-header-overrides.json'
out_manifest = DATA / 'drive-drawings-map.enriched.json'
out_names = DATA / 'device-names-from-pdf-headers.json'

manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
overrides_raw = json.loads(overrides_path.read_text(encoding='utf-8')) if overrides_path.exists() else {}
if 'byFileId' in overrides_raw:
    overrides = overrides_raw['byFileId']
else:
    overrides = overrides_raw

items = manifest.get('items', [])
name_index = {}
for item in items:
    fid = str(item.get('fileId') or '')
    model = str(item.get('normalizedModel') or item.get('model') or '').strip()
    ov = overrides.get(fid) or overrides.get(model)
    if not ov:
        continue
    device_name = ov.get('deviceName') or ov.get('extractedDeviceName') or ''
    display = ov.get('displayTitle') or (f"{model} — {device_name}" if model and device_name else device_name)
    if display:
        item['deviceName'] = device_name
        item['displayTitle'] = display
        item['pdfHeaderConfidence'] = ov.get('confidence', '')
        item['pdfHeaderSource'] = ov.get('source', 'pdf-header-overrides')
        name_index[model or fid] = {
            'fileId': fid,
            'model': model,
            'deviceName': device_name,
            'displayTitle': display,
            'brand': ov.get('brand') or item.get('brand'),
            'confidence': ov.get('confidence', ''),
        }
    if ov.get('brand') and item.get('brand') in ('', 'DO ROZPOZNANIA', 'NIEZNANA', None):
        item['brand'] = ov['brand']

manifest['updatedAt'] = manifest.get('updatedAt') or manifest.get('generatedAt')
manifest['enrichedWithPdfHeaders'] = len(name_index)
out_manifest.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
out_names.write_text(json.dumps({'count': len(name_index), 'items': list(name_index.values())}, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'Enriched entries: {len(name_index)}')
print(out_manifest)
print(out_names)

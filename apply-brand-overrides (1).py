#!/usr/bin/env python3
"""Apply manual brand overrides to PGW full Drive manifest.

Usage:
  python scripts/apply-brand-overrides.py \
    data/drive-drawings-map.full.json \
    data/brand-resolution-overrides.json \
    data/drive-drawings-map.full.json
"""
import json, sys
from pathlib import Path

if len(sys.argv) < 4:
    print(__doc__)
    sys.exit(2)

manifest_path = Path(sys.argv[1])
overrides_path = Path(sys.argv[2])
out_path = Path(sys.argv[3])

manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
overrides = json.loads(overrides_path.read_text(encoding='utf-8'))
models = overrides.get('models', overrides)

def keys(item):
    vals = [item.get('model'), item.get('normalizedModel'), item.get('deviceIndex'), item.get('title')]
    out = []
    for v in vals:
        if not v:
            continue
        s = str(v).strip().upper().replace('_','-')
        out.append(s)
        out.append(s.replace('.PDF',''))
    return list(dict.fromkeys(out))

changed = 0
for item in manifest.get('items', []):
    for k in keys(item):
        if k in models:
            item['brand'] = models[k]
            item['brandConfidence'] = 'manual_confirmed'
            item['brandReason'] = 'Ręczne nadpisanie z brand-resolution-overrides.json'
            changed += 1
            break

manifest['updatedBy'] = 'scripts/apply-brand-overrides.py'
manifest['manualBrandOverridesApplied'] = changed
out_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'OK: applied {changed} brand overrides -> {out_path}')

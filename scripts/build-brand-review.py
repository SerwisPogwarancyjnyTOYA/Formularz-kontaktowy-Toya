#!/usr/bin/env python3
"""Build brand-review-unknown.json from full manifest."""
import json, collections
from pathlib import Path
base = Path(__file__).resolve().parents[1]
manifest = json.loads((base/'data/drive-drawings-map.full.json').read_text(encoding='utf-8'))
items=[]
for i in manifest.get('items', []):
    if str(i.get('brand','')).upper() in ('DO ROZPOZNANIA','NIEZNANA','INNE'):
        model=str(i.get('model') or i.get('normalizedModel') or '')
        digits=''.join(ch for ch in model if ch.isdigit())
        bucket=(digits[:2]+'xxx') if len(digits)>=5 else 'inne'
        items.append({
            'model': model,
            'title': i.get('title'),
            'fileId': i.get('fileId'),
            'previewUrl': i.get('previewUrl'),
            'viewerUrl': i.get('viewerUrl'),
            'path': i.get('path'),
            'currentBrand': i.get('brand'),
            'suggestedBrand': i.get('suggestedBrand',''),
            'suggestionReason': i.get('suggestionReason',''),
            'bucket': bucket,
            'reviewStatus': 'needs_manual_brand_confirmation'
        })
counts=collections.Counter(x['bucket'] for x in items)
out={'generatedAt':manifest.get('updatedAt') or manifest.get('generatedAt'), 'count':len(items), 'buckets':dict(sorted(counts.items())), 'items':items}
(base/'data/brand-review-unknown.json').write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'OK: {len(items)} items -> data/brand-review-unknown.json')

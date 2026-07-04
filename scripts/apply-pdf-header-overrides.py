#!/usr/bin/env python3
"""Merge Apps Script PDF header extraction output into PGW Service Hub data.

Usage from repo root:
  python3 scripts/apply-pdf-header-overrides.py --input pdf-header-overrides.generated.json
"""
import argparse, json, pathlib, datetime, re

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / 'data'

def load(path, default):
    p = pathlib.Path(path)
    if not p.exists(): return default
    return json.loads(p.read_text(encoding='utf-8'))

def save(path, data):
    pathlib.Path(path).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')

def norm(s):
    return re.sub(r'\s+', '', str(s or '').upper().replace('_','-')).strip()

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--input', required=True, help='pdf-header-overrides.generated.json from Apps Script')
    ap.add_argument('--no-update-devices', action='store_true')
    args = ap.parse_args()
    incoming = load(args.input, {})
    existing = load(DATA / 'pdf-header-overrides.json', {'byFileId': {}, 'byModel': {}})
    existing.setdefault('byFileId', {})
    existing.setdefault('byModel', {})

    for fid, rec in (incoming.get('byFileId') or {}).items():
        existing['byFileId'][str(fid)] = rec
    for model, rec in (incoming.get('byModel') or {}).items():
        existing['byModel'][norm(model)] = rec
    existing['generatedAt'] = datetime.datetime.utcnow().isoformat(timespec='seconds') + 'Z'
    existing['version'] = 'merged-v66'
    existing['count'] = len(existing.get('byFileId', {}))
    save(DATA / 'pdf-header-overrides.json', existing)

    if not args.no_update_devices:
        devices = load(DATA / 'devices.json', [])
        drawings = load(DATA / 'drawings.json', [])
        by_model = {norm(k): v for k, v in existing.get('byModel', {}).items()}
        changed_devices = 0
        changed_drawings = 0
        for d in devices:
            rec = by_model.get(norm(d.get('deviceIndex')))
            if rec and rec.get('deviceName'):
                d['title'] = rec['deviceName']
                d['deviceName'] = rec['deviceName']
                d['displayTitle'] = rec.get('displayTitle') or f"{d.get('deviceIndex')} — {rec['deviceName']}"
                d['headerConfidence'] = rec.get('confidence', 'medium')
                d['headerSource'] = rec.get('source', 'apps-script-pdf-header-extractor-v66')
                changed_devices += 1
        for dr in drawings:
            rec = by_model.get(norm(dr.get('deviceIndex')))
            if rec and rec.get('deviceName'):
                dr['title'] = rec.get('displayTitle') or f"{dr.get('deviceIndex')} — {rec['deviceName']}"
                dr['deviceName'] = rec['deviceName']
                dr['displayTitle'] = rec.get('displayTitle') or dr['title']
                dr['headerConfidence'] = rec.get('confidence', 'medium')
                dr['headerSource'] = rec.get('source', 'apps-script-pdf-header-extractor-v66')
                changed_drawings += 1
        save(DATA / 'devices.json', devices)
        save(DATA / 'drawings.json', drawings)
        print(f'Updated devices: {changed_devices}, drawings: {changed_drawings}')
    print(f'Merged headers: {existing["count"]}')

if __name__ == '__main__':
    main()

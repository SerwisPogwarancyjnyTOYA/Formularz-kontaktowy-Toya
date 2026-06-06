#!/usr/bin/env python3
"""Roboczy importer rysunków PDF do katalogu części.
Wymaga lokalnych PDF-ów oraz narzędzia pdftotext. Wynik: JSON z pozycjami części.
"""
import json, re, subprocess, sys
from pathlib import Path

def norm_index(name):
    m=re.search(r'(Y[GT]-?\d{3,7}|\d{5})', name, re.I)
    return m.group(1).upper().replace('YT','YT-').replace('YG','YG-') if m else Path(name).stem

def extract_text(pdf):
    return subprocess.check_output(['pdftotext','-layout',str(pdf),'-'], text=True, errors='ignore')

def rows_from_text(txt, device):
    rows=[]
    for line in txt.splitlines():
        s=' '.join(line.split())
        m=re.match(r'^(\d{1,3})\s+([A-Z0-9\-]{4,})\s+(?:[A-Z0-9\-]+\s+)?(.+)$', s)
        if not m: continue
        pos, sap, rest=m.groups()
        if len(rest) < 3: continue
        rows.append({'deviceIndex':device,'position':pos,'partIndex':sap,'partName':rest,'source':'pdf-import'})
    return rows

def main(folder):
    out=[]
    for pdf in Path(folder).rglob('*.pdf'):
        device=norm_index(pdf.name)
        try: out += rows_from_text(extract_text(pdf), device)
        except Exception as e: print('ERR', pdf, e, file=sys.stderr)
    print(json.dumps(out, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv)>1 else '.')

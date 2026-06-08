#!/usr/bin/env python3
"""
PGW Service Hub — builder pełnego katalogu offline.

Cel:
- NIE scrapować TOYA24 po stronie klienta.
- Wczytać lokalny eksport Google Sheets/XLSX z arkusza Baza części.
- Zbudować data/catalog.generated.json i assets/database.js.
- Dodać fallbacki TOYA24/Drive dla modeli, których PDF nie jest jeszcze zmapowany.

Użycie:
  python3 scripts/build-full-catalog-from-sources.py \
    --xlsx ../Baza_czesci_PGW_GOOGLE_SHEETS_START_2026-06-03.xlsx \
    --out data/catalog.generated.json \
    --database assets/database.js
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple
from zipfile import ZipFile
from xml.etree import ElementTree as ET

NS = {
    'a': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
}

KNOWN_TOYA24 = {
    'YT-82200': {
        'productName': 'Profesjonalna polerka mimośrodowa',
        'brand': 'YATO',
        'category': 'Polerki',
        'toya24ProductUrl': 'https://toya24.pl/pl-PL/products/profesjonalna-polerka-mimosrodowa-10012170',
        'toya24PartsPdfUrl': 'https://toya24.pl/settings.php?getAttachmentp=516727_10012170_ca71231abd43fa8d7d162ab06e8a7071',
        'driveViewUrl': 'https://drive.google.com/file/d/1EIgrbkm1P63569i1m2B-23LZt-GiDJDU/view?usp=drivesdk',
        'drivePreviewUrl': 'https://drive.google.com/file/d/1EIgrbkm1P63569i1m2B-23LZt-GiDJDU/preview',
    },
    'YG-03395': {
        'productName': 'YATO GASTRO — urządzenie z rysunkiem backup',
        'brand': 'YATO GASTRO',
        'category': 'Gastro',
        'driveViewUrl': 'https://drive.google.com/file/d/1sdnkBXMp7K3t6BeoEGr870nUviAwf4ub/view',
        'activeSource': 'Drive backup',
    },
}

HEADER_ALIASES = {
    'partIndex': ['Indeks części', 'partIndex', 'index'],
    'altIndex': ['Alias / indeks alternatywny', 'Alias', 'alias'],
    'deviceIndex': ['Model urządzenia', 'model', 'deviceIndex'],
    'brandSeries': ['Marka / seria', 'brand', 'Marka'],
    'partName': ['Nazwa części PL', 'Nazwa części', 'partNamePL'],
    'partNameEN': ['Nazwa techniczna / EN', 'partNameEN'],
    'position': ['Pozycja z rysunku', 'Pozycja', 'position'],
    'drawingName': ['Nazwa rysunku / pliku', 'Rysunek', 'drawingName'],
    'drawingUrl': ['Link do rysunku', 'drivePdfUrl', 'sourcePdf'],
    'availability': ['Status dostępności', 'Ocena dostępności', 'availabilityStatus'],
    'priceStatus': ['Status ceny', 'priceStatus'],
    'source': ['Źródło', 'source'],
    'confidence': ['Pewność danych', 'confidence'],
    'prefix': ['Prefiks', 'prefix'],
    'type': ['Typ indeksu', 'type'],
    'needsSap': ['Potrzebny SAP?', 'needsSap'],
}

def norm_text(s: object) -> str:
    if s is None:
        return ''
    s = str(s).strip()
    s = re.sub(r'\s+', ' ', s)
    return s

def slug(s: str) -> str:
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode('ascii')
    s = re.sub(r'[^a-zA-Z0-9]+', '-', s.lower()).strip('-')
    return s or 'x'

def title_case_pl(s: str) -> str:
    s = norm_text(s)
    if not s:
        return ''
    # Preserve all-caps short electrical terms where sensible.
    words = []
    for w in s.split(' '):
        if w.upper() in {'PCB', 'LED', 'LCD', 'PVC'} or re.search(r'\d', w):
            words.append(w.upper() if w.upper() in {'PCB','LED','LCD','PVC'} else w)
        else:
            words.append(w[:1].upper() + w[1:].lower())
    return ' '.join(words)

def col_to_index(col: str) -> int:
    n = 0
    for c in col:
        n = n * 26 + ord(c.upper()) - 64
    return n - 1

def cell_ref_to_col(ref: str) -> int:
    m = re.match(r'([A-Z]+)', ref)
    return col_to_index(m.group(1)) if m else 0

def read_shared_strings(z: ZipFile) -> List[str]:
    try:
        root = ET.fromstring(z.read('xl/sharedStrings.xml'))
    except KeyError:
        return []
    out = []
    for si in root.findall('a:si', NS):
        parts = []
        for t in si.findall('.//a:t', NS):
            parts.append(t.text or '')
        out.append(''.join(parts))
    return out

def workbook_sheet_map(z: ZipFile) -> Dict[str, str]:
    wb = ET.fromstring(z.read('xl/workbook.xml'))
    rels = ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
    rid_to_target = {r.attrib['Id']: r.attrib['Target'].lstrip('/') for r in rels}
    out = {}
    for sheet in wb.find('a:sheets', NS):
        name = sheet.attrib['name']
        rid = sheet.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']
        out[name] = rid_to_target[rid]
    return out

def read_sheet_rows(xlsx: Path, sheet_name: str) -> List[List[str]]:
    with ZipFile(xlsx) as z:
        shared = read_shared_strings(z)
        smap = workbook_sheet_map(z)
        if sheet_name not in smap:
            raise SystemExit(f'Brak arkusza: {sheet_name}. Dostępne: {list(smap)}')
        target = smap[sheet_name]
        if not target.startswith('xl/'):
            target = 'xl/' + target
        root = ET.fromstring(z.read(target))
        rows = []
        for row in root.findall('.//a:sheetData/a:row', NS):
            vals = []
            max_col = -1
            cell_vals = {}
            for c in row.findall('a:c', NS):
                ref = c.attrib.get('r', '')
                col = cell_ref_to_col(ref)
                max_col = max(max_col, col)
                v = c.find('a:v', NS)
                is_inline = c.find('a:is/a:t', NS)
                val = ''
                if is_inline is not None:
                    val = is_inline.text or ''
                elif v is not None:
                    raw = v.text or ''
                    if c.attrib.get('t') == 's':
                        try:
                            val = shared[int(raw)]
                        except Exception:
                            val = raw
                    else:
                        val = raw
                cell_vals[col] = norm_text(val)
            if max_col >= 0:
                vals = [cell_vals.get(i, '') for i in range(max_col+1)]
                rows.append(vals)
        return rows

def index_headers(header: List[str]) -> Dict[str, int]:
    result = {}
    lower_to_i = {norm_text(h).casefold(): i for i, h in enumerate(header)}
    for key, aliases in HEADER_ALIASES.items():
        for a in aliases:
            i = lower_to_i.get(a.casefold())
            if i is not None:
                result[key] = i
                break
    return result

def get(row: List[str], h: Dict[str, int], key: str) -> str:
    i = h.get(key)
    return norm_text(row[i]) if i is not None and i < len(row) else ''

def normalize_model(s: str) -> str:
    s = norm_text(s).upper().replace(' ', '')
    if not s:
        return ''
    # Normalize YT82200 -> YT-82200, YG03395 -> YG-03395.
    s = re.sub(r'^(YT|YG|YTG|TOYA|VOREL|STHOR|LUND|FLO|FALA)[-_]?(\d{3,6}[A-Z]?)$', r'\1-\2', s)
    s = s.replace('_', '-')
    return s

def infer_model(part_index: str, explicit_model: str = '') -> str:
    explicit = normalize_model(explicit_model)
    if explicit:
        return explicit
    p = norm_text(part_index).upper().replace(' ', '')
    # ZY8220011 -> YT-82200, ZY85716-52 -> YT-85716.
    m = re.match(r'^ZY[-_]?([0-9]{5})(?:[-_A-Z0-9].*)?$', p)
    if m:
        return f'YT-{m.group(1)}'
    # ZG03395-13 -> YG-03395.
    m = re.match(r'^ZG[-_]?([0-9]{5})(?:[-_A-Z0-9].*)?$', p)
    if m:
        return f'YG-{m.group(1)}'
    # ZS/STHOR? Keep conservative fallback as product-like family, not model.
    m = re.match(r'^(YT|YG)[-_]?([0-9]{5}[A-Z]?)', p)
    if m:
        return f'{m.group(1)}-{m.group(2)}'
    return p if re.match(r'^[A-Z]{1,3}-?\d{4,6}', p) else ''

def brand_from(model: str, brand_series: str, part_index: str='') -> str:
    b = norm_text(brand_series)
    if b and b.lower() not in {'yato / część modelowa', 'toya / część modelowa'}:
        return b
    if model.startswith('YG-') or part_index.upper().startswith('ZG'):
        return 'YATO GASTRO'
    if model.startswith('YT-') or part_index.upper().startswith('ZY'):
        return 'YATO'
    return b or 'TOYA'

def make_keywords(*vals: str) -> str:
    base = ' '.join(norm_text(v) for v in vals if norm_text(v))
    extra = []
    b = base.casefold()
    if 'łożysko' in b or 'lozysko' in b:
        extra += ['łożysko', 'lozysko', 'bearing']
    if 'szczot' in b:
        extra += ['szczotka', 'szczotki', 'węglowa', 'weglowa', 'carbon brush']
    if 'włącznik' in b or 'wlacznik' in b:
        extra += ['włącznik', 'wlacznik', 'przełącznik', 'przelacznik', 'switch']
    if 'tarcza' in b or 'pad' in b:
        extra += ['tarcza', 'pad', 'dysk', 'krążek', 'krazek']
    return norm_text(base + ' ' + ' '.join(extra))

def build_catalog(xlsx: Path) -> Dict[str, object]:
    rows = read_sheet_rows(xlsx, 'Baza części')
    if len(rows) < 5:
        raise SystemExit('Za mało wierszy w Baza części')
    header = rows[3]
    h = index_headers(header)
    if 'partIndex' not in h or 'partName' not in h:
        raise SystemExit(f'Nie znaleziono wymaganych kolumn. Nagłówki: {header}')

    parts = []
    drawings_by_model: Dict[str, dict] = {}
    seen_ids = set()
    counters = {'rows': 0, 'withoutPartIndex': 0, 'withoutName': 0, 'withoutModel': 0, 'duplicateIds': 0}

    # Prime known drawings
    for model, k in KNOWN_TOYA24.items():
        drawings_by_model[model] = {
            'id': slug(model),
            'deviceIndex': model,
            'brand': k.get('brand', 'YATO'),
            'title': f'{model} — {k.get("productName", "rysunek / karta produktu")}',
            'type': 'toya24-pdf' if k.get('toya24PartsPdfUrl') else 'drive-pdf',
            'status': 'mapped',
            'toya24ProductUrl': k.get('toya24ProductUrl', f'https://toya24.pl/pl-PL/search?text={model}'),
            'toya24PartsPdfUrl': k.get('toya24PartsPdfUrl', ''),
            'driveViewUrl': k.get('driveViewUrl', ''),
            'drivePreviewUrl': k.get('drivePreviewUrl', ''),
            'activeSource': k.get('activeSource', 'TOYA24' if k.get('toya24PartsPdfUrl') else 'Drive backup'),
        }

    for r in rows[4:]:
        counters['rows'] += 1
        part_index = norm_text(get(r, h, 'partIndex')).upper()
        if not part_index:
            counters['withoutPartIndex'] += 1
            continue
        part_name = title_case_pl(get(r, h, 'partName'))
        if not part_name:
            counters['withoutName'] += 1
            part_name = 'Część bez nazwy — do weryfikacji'
        alt = norm_text(get(r, h, 'altIndex'))
        explicit_model = get(r, h, 'deviceIndex')
        model = infer_model(part_index, explicit_model)
        if not model:
            counters['withoutModel'] += 1
            model = 'MODEL-DO-SPRAWDZENIA'
        brand = brand_from(model, get(r, h, 'brandSeries'), part_index)
        pos = norm_text(get(r, h, 'position'))
        drawing_url = norm_text(get(r, h, 'drawingUrl'))
        drawing_name = norm_text(get(r, h, 'drawingName'))
        availability = norm_text(get(r, h, 'availability')) or 'Do potwierdzenia przez serwis'
        price_status = norm_text(get(r, h, 'priceStatus')) or 'Do SAP'
        confidence = norm_text(get(r, h, 'confidence')) or 'średnia'
        source = norm_text(get(r, h, 'source')) or 'Baza części'
        known = KNOWN_TOYA24.get(model, {})
        device_name = known.get('productName') or drawing_name or f'{model} — urządzenie / rodzina części'
        category = known.get('category') or ''
        drawing_id = slug(model)
        pid = f'{slug(model)}-{slug(part_index)}-{slug(pos or "bezpoz")}'
        if pid in seen_ids:
            counters['duplicateIds'] += 1
            pid = f'{pid}-{len(seen_ids)}'
        seen_ids.add(pid)
        keywords = make_keywords(model, part_index, alt, part_name, get(r,h,'partNameEN'), pos, device_name, brand)
        parts.append({
            'id': pid,
            'public': True,
            'deviceIndex': model,
            'deviceName': device_name,
            'brand': brand,
            'category': category,
            'partIndex': part_index,
            'altIndex': alt,
            'partName': part_name,
            'partNameEN': norm_text(get(r, h, 'partNameEN')),
            'position': pos,
            'drawingId': drawing_id,
            'drawingName': drawing_name,
            'availability': availability,
            'priceStatus': price_status,
            'confidence': confidence,
            'source': source,
            'keywords': keywords,
            'needsSap': norm_text(get(r, h, 'needsSap')),
        })
        if model not in drawings_by_model:
            drawings_by_model[model] = {
                'id': drawing_id,
                'deviceIndex': model,
                'brand': brand,
                'title': f'{model} — TOYA24 / Drive fallback',
                'type': 'toya24-search-fallback',
                'status': 'fallback_search',
                'toya24ProductUrl': f'https://toya24.pl/pl-PL/search?text={model}',
                'toya24PartsPdfUrl': '',
                'driveViewUrl': drawing_url or f'https://drive.google.com/drive/search?q={model}',
                'drivePreviewUrl': '',
                'activeSource': 'TOYA24 search / Drive fallback',
            }
        else:
            if drawing_url and not drawings_by_model[model].get('driveViewUrl'):
                drawings_by_model[model]['driveViewUrl'] = drawing_url
            if drawing_name and drawings_by_model[model]['title'].endswith('fallback'):
                drawings_by_model[model]['title'] = f'{model} — {drawing_name}'

    # Prioritize: exact named models first, then part families.
    parts.sort(key=lambda p: (p.get('deviceIndex') == 'MODEL-DO-SPRAWDZENIA', p.get('deviceIndex',''), p.get('position',''), p.get('partIndex','')))
    drawings = list(drawings_by_model.values())
    drawings.sort(key=lambda d: d.get('deviceIndex',''))
    meta = {
        'generatedAt': datetime.now(timezone.utc).isoformat(timespec='seconds'),
        'build': 'full-catalog-offline-builder-v2',
        'sourceFile': str(xlsx.name),
        'partsCount': len(parts),
        'devicesCount': len(drawings),
        'knownToYa24Mapped': sum(1 for d in drawings if d.get('toya24PartsPdfUrl')),
        'fallbackDrawings': sum(1 for d in drawings if not d.get('toya24PartsPdfUrl')),
        'counters': counters,
        'tests': {
            'ZY8220011': any(p.get('partIndex') == 'ZY8220011' for p in parts),
            'YT-82200': any(d.get('deviceIndex') == 'YT-82200' for d in drawings),
            'YT-85177': any(d.get('deviceIndex') == 'YT-85177' for d in drawings),
        },
        'sources': ['Baza części XLSX/Google Sheets', 'TOYA24 manual/seed + crawler-ready', 'Drive backup mapping'],
    }
    return {'meta': meta, 'parts': parts, 'drawings': drawings}

def write_database_js(catalog: dict, out: Path) -> None:
    out.write_text(
        '// Wygenerowane automatycznie z data/catalog.generated.json. Nie edytuj ręcznie.\n'
        'window.PGW_PARTS = ' + json.dumps(catalog['parts'], ensure_ascii=False, separators=(',', ':')) + ';\n'
        'window.PGW_DRAWINGS = ' + json.dumps(catalog['drawings'], ensure_ascii=False, separators=(',', ':')) + ';\n'
        'window.PGW_DATABASE_META = ' + json.dumps(catalog['meta'], ensure_ascii=False, separators=(',', ':')) + ';\n',
        encoding='utf-8'
    )


def build_catalog_from_sap_xlsm(xlsm: Path) -> Dict[str, object]:
    """Importuje prosty arkusz SAP: kol. A indeks, B nazwa, D zamiennik/ZUN, J mag102, K mag105."""
    rows = read_sheet_rows(xlsm, 'Arkusz1')
    parts = []
    drawings_by_model: Dict[str, dict] = {}
    for model, k in KNOWN_TOYA24.items():
        drawings_by_model[model] = {
            'id': slug(model), 'deviceIndex': model, 'brand': k.get('brand', 'YATO'),
            'title': f'{model} — {k.get("productName", "rysunek / karta produktu")}',
            'type': 'toya24-pdf' if k.get('toya24PartsPdfUrl') else 'drive-pdf',
            'status': 'mapped', 'toya24ProductUrl': k.get('toya24ProductUrl', f'https://toya24.pl/pl-PL/search?text={model}'),
            'toya24PartsPdfUrl': k.get('toya24PartsPdfUrl', ''),
            'driveViewUrl': k.get('driveViewUrl', ''), 'drivePreviewUrl': k.get('drivePreviewUrl', ''),
            'activeSource': k.get('activeSource', 'TOYA24' if k.get('toya24PartsPdfUrl') else 'Drive backup'),
        }
    seen = set()
    # row 1/2 headers, data from row 3
    for row in rows[2:]:
        part_index = norm_text(row[0] if len(row)>0 else '').upper()
        part_name = title_case_pl(row[1] if len(row)>1 else '')
        if not part_index or not part_name:
            continue
        alt = norm_text(row[3] if len(row)>3 else '')
        mag102 = norm_text(row[9] if len(row)>9 else '')
        mag105 = norm_text(row[10] if len(row)>10 else '')
        loc = norm_text(row[11] if len(row)>11 else '')
        model = infer_model(part_index, '')
        if not model:
            # Zachowaj jako rodzina indeksu, żeby wyszukiwarka nie traciła części uniwersalnych.
            model = part_index.split('-')[0] if '-' in part_index else part_index[:7]
        brand = brand_from(model, '', part_index)
        known = KNOWN_TOYA24.get(model, {})
        device_name = known.get('productName') or f'{model} — rodzina części / do dopięcia rysunku'
        pos = ''
        m = re.search(r'[-_](\d+[A-Z]?)$', part_index)
        if m:
            pos = m.group(1)
        else:
            m = re.match(r'^Z[YG](\d{5})(\d{2,3}[A-Z]?)$', part_index)
            if m:
                rawpos = m.group(2).lstrip('0') or '0'
                pos = rawpos
        availability_bits = []
        if mag102: availability_bits.append(f'0102: {mag102}')
        if mag105: availability_bits.append(f'0105: {mag105}')
        availability = ' / '.join(availability_bits) if availability_bits else 'Do potwierdzenia przez serwis'
        pid = f'{slug(model)}-{slug(part_index)}-{slug(pos or "bezpoz")}'
        if pid in seen:
            continue
        seen.add(pid)
        parts.append({
            'id': pid, 'public': True, 'deviceIndex': model, 'deviceName': device_name,
            'brand': brand, 'category': known.get('category',''), 'partIndex': part_index,
            'altIndex': alt, 'partName': part_name, 'partNameEN': '', 'position': pos,
            'drawingId': slug(model), 'drawingName': '', 'availability': availability,
            'stock0102': mag102, 'stock0105': mag105, 'warehouseLocation': loc,
            'priceStatus': 'Do SAP', 'confidence': 'średnia', 'source': 'stan na 2026.05.29.xlsm',
            'keywords': make_keywords(model, part_index, alt, part_name, pos, brand), 'needsSap': 'Tak',
        })
        if model not in drawings_by_model:
            drawings_by_model[model] = {
                'id': slug(model), 'deviceIndex': model, 'brand': brand,
                'title': f'{model} — TOYA24 / Drive fallback', 'type': 'toya24-search-fallback',
                'status': 'fallback_search', 'toya24ProductUrl': f'https://toya24.pl/pl-PL/search?text={model}',
                'toya24PartsPdfUrl': '', 'driveViewUrl': f'https://drive.google.com/drive/search?q={model}',
                'drivePreviewUrl': '', 'activeSource': 'TOYA24 search / Drive fallback',
            }
    parts.sort(key=lambda p: (p.get('deviceIndex',''), p.get('position',''), p.get('partIndex','')))
    drawings = sorted(drawings_by_model.values(), key=lambda d: d.get('deviceIndex',''))
    meta = {
        'generatedAt': datetime.now(timezone.utc).isoformat(timespec='seconds'),
        'build': 'sap-xlsm-import-v1', 'sourceFile': xlsm.name,
        'partsCount': len(parts), 'devicesCount': len(drawings),
        'knownToYa24Mapped': sum(1 for d in drawings if d.get('toya24PartsPdfUrl')),
        'fallbackDrawings': sum(1 for d in drawings if not d.get('toya24PartsPdfUrl')),
        'tests': {'ZY8220011': any(p.get('partIndex')=='ZY8220011' for p in parts), 'YT-85177': any(d.get('deviceIndex')=='YT-85177' for d in drawings)}
    }
    return {'meta': meta, 'parts': parts, 'drawings': drawings}

def main(argv: Optional[List[str]] = None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--xlsx', type=Path, help='Eksport Google Sheets / Baza części')
    ap.add_argument('--sap-xlsm', type=Path, help='Plik SAP stan na ...xlsm')
    ap.add_argument('--out', default=Path('data/catalog.generated.json'), type=Path)
    ap.add_argument('--database', default=Path('assets/database.js'), type=Path)
    ap.add_argument('--report', default=Path('data/catalog-health-report.json'), type=Path)
    args = ap.parse_args(argv)
    catalog = build_catalog(args.xlsx) if args.xlsx else {'meta': {}, 'parts': [], 'drawings': []}
    if args.sap_xlsm:
        sap_catalog = build_catalog_from_sap_xlsm(args.sap_xlsm)
        # merge, prefer explicit Baza rows, add SAP rows not already present
        seen = {p.get('partIndex') for p in catalog.get('parts', [])}
        for p in sap_catalog['parts']:
            if p.get('partIndex') not in seen:
                catalog['parts'].append(p); seen.add(p.get('partIndex'))
        dseen = {d.get('deviceIndex') for d in catalog.get('drawings', [])}
        for d in sap_catalog['drawings']:
            if d.get('deviceIndex') not in dseen:
                catalog['drawings'].append(d); dseen.add(d.get('deviceIndex'))
        catalog['meta'] = {**sap_catalog['meta'], **catalog.get('meta', {}), 'build': 'full-catalog-offline-builder-v3', 'partsCount': len(catalog['parts']), 'devicesCount': len(catalog['drawings']), 'sapRows': sap_catalog['meta'].get('partsCount'), 'sources': ['Baza części XLSX/Google Sheets', 'stan na 2026.05.29.xlsm', 'TOYA24 manual/seed + crawler-ready', 'Drive backup mapping']}
    if not catalog.get('parts'):
        raise SystemExit('Brak danych wejściowych: podaj --xlsx i/lub --sap-xlsm')
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.database.parent.mkdir(parents=True, exist_ok=True)
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(catalog, ensure_ascii=False, indent=2), encoding='utf-8')
    write_database_js(catalog, args.database)
    report = {
        'meta': catalog['meta'],
        'sampleParts': catalog['parts'][:20],
        'sampleDrawings': catalog['drawings'][:20],
        'todo': [
            'Douruchomić crawler TOYA24 i wypełnić toya24ProductUrl/toya24PartsPdfUrl dla modeli.',
            'Zmapować Drive PDF -> model dla rysunków z folderu PGW - Rysunki.',
            'Przepuścić parser PDF dla rysunków, gdzie Baza części nie ma pozycji z rysunku.'
        ]
    }
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(catalog['meta'], ensure_ascii=False, indent=2))
    return 0

if __name__ == '__main__':
    raise SystemExit(main())

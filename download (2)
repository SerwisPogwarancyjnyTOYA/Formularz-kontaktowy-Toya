#!/usr/bin/env python3
import os, re, json, zipfile, subprocess, tempfile, hashlib, time, html
from pathlib import Path
from collections import defaultdict
import xml.etree.ElementTree as ET

SRC_DIR = Path('/mnt/data/github_zip')
OUT_DIR = Path('/mnt/data/pgw_build')
OUT_DIR.mkdir(exist_ok=True)
LOG = OUT_DIR/'build.log'

DRAW_EXTS = {'.pdf','.png','.jpg','.jpeg','.webp','.gif','.svg','.bmp'}
DOC_EXTS = {'.docx','.doc','.xlsx','.xls','.txt'}

BRANDS = ['YATO GASTRO','YATO','VOREL','STHOR','LUND','FLO','FALA','TOYA']
PART_RE = re.compile(r'\b(?:ZUN-\d{4,}|Z(?:Y|G)?[A-Z]{0,3}\d{3,}[A-Z0-9\-]*|G[VZ]\d{3,}[A-Z0-9\-]*|YT-?\d{3,}[A-Z0-9\-]*|YG-?\d{3,}[A-Z0-9\-]*)\b', re.I)
DEVICE_RE = re.compile(r'\b(?:YT|YG|YTG|TOYA|VOREL|STHOR|LUND|FLO|FALA)?[-_ ]?\d{4,6}[A-Z]?\b|\bY[TG][- ]?\d{3,6}[A-Z]?\b', re.I)
SPACE_SPLIT = re.compile(r'\s{2,}')

ns={'a':'http://schemas.openxmlformats.org/spreadsheetml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}

def log(msg):
    print(msg, flush=True)
    with open(LOG,'a',encoding='utf-8') as f: f.write(str(msg)+'\n')

def norm_spaces(s): return re.sub(r'\s+',' ',str(s or '')).strip()
def strip_accents(s):
    import unicodedata
    return ''.join(c for c in unicodedata.normalize('NFD', str(s or '')) if unicodedata.category(c)!='Mn')
def slug(s, max_len=90):
    s = strip_accents(s)
    s = re.sub(r'[^A-Za-z0-9._-]+','-',s).strip('-._')
    s = re.sub(r'-{2,}','-',s)
    return s[:max_len] or 'plik'
def norm_index(s):
    s=norm_spaces(s).upper().replace('_','-')
    s=re.sub(r'\s+','-',s)
    return s

def extract_device(text):
    text = str(text or '')
    # prefer YT/YG with prefix
    pref = re.search(r'\bY[TG][- ]?\d{3,6}[A-Z]?\b', text, re.I)
    if pref: return norm_index(pref.group(0).replace(' ', '-'))
    # Czesci_zamienne_79015 or folder 79015
    m = re.search(r'(?:Czesci[_ -]?zamienne[_ -]?)?(?:YT-|YG-)?(\d{4,6}[A-Z]?)', text, re.I)
    if m: return m.group(1).upper()
    return ''

def detect_brand(path, title=''):
    src=(str(path)+' '+str(title)).upper()
    if 'YATO GASTRO' in src or '/YG' in src or 'YG-' in src: return 'YATO GASTRO'
    for b in BRANDS:
        if b in src: return b
    if re.search(r'\bYT[- ]?\d+', src): return 'YATO'
    return ''

def url_path_for(original_path, device, brand, ext):
    # docelowy, czysty układ repo: drawings/BRAND/PREFIX/DEVICE/file.pdf
    brand_dir = (brand or 'UNMAPPED').upper().replace(' ', '_')
    if brand_dir == 'YATO_GASTRO': brand_dir='YATO_GASTRO'
    prefix='OTHER'
    if device.upper().startswith('YT'): prefix='YT'
    elif device.upper().startswith('YG'): prefix='YG'
    elif device and device[0].isdigit(): prefix='NUMERIC'
    base = slug(Path(original_path).stem, 100) + ext.lower()
    dev = slug(device or 'bez-indeksu', 70)
    return f'drawings/{brand_dir}/{prefix}/{dev}/{base}'

def title_from_text(text, fallback):
    lines=[norm_spaces(x) for x in text.splitlines()[:20] if norm_spaces(x)]
    # combine first lines until marker
    chunks=[]
    for ln in lines:
        if re.search(r'TOYA S\.A\.|AKTUALIZACJA|CZ[EĘ]ŚCI|RYSUNEK', ln, re.I):
            if chunks: break
        chunks.append(ln)
        if len(' '.join(chunks))>100: break
    title=norm_spaces(' '.join(chunks))
    return title[:180] if title else Path(fallback).stem

def parse_parts_from_text(text, drawing_id, device, drawing_path, title):
    parts=[]; in_list=False; previous=None
    for raw in text.splitlines():
        line=raw.rstrip('\n')
        low=strip_accents(line).lower()
        if 'lista czesci' in low or 'spare parts list' in low or 'parts list' in low:
            in_list=True; continue
        if not in_list and not PART_RE.search(line):
            continue
        if re.search(r'^(NO\.?|LP\.?|NR\.?|INDEKS|ITEM|POS)\b', norm_spaces(line), re.I):
            continue
        cols=[norm_spaces(c) for c in SPACE_SPLIT.split(line.strip()) if norm_spaces(c)]
        if len(cols) >= 2 and re.match(r'^[0-9A-Za-z,./\-– ]{1,18}$', cols[0]) and PART_RE.fullmatch(cols[1].replace(' ','')):
            pos = norm_index(cols[0])
            idx = norm_index(cols[1])
            rest = cols[2:]
            zun=''
            if rest and re.match(r'^ZUN-\d+', rest[0], re.I):
                zun = norm_index(rest.pop(0))
            name_en=''; name_pl=''
            if len(rest) >= 2:
                name_en = rest[0]
                name_pl = ' '.join(rest[1:])
            elif len(rest)==1:
                name_pl = rest[0]
            rec={'id': f'{idx}|{drawing_id}|{pos}', 'deviceIndex': device, 'position': pos, 'partIndex': idx, 'zun':zun, 'namePl': name_pl, 'nameEn': name_en, 'drawingId': drawing_id, 'drawingPath': drawing_path, 'drawingTitle': title}
            parts.append(rec); previous=rec; continue
        # fallback: any line with part index; useful for factory drawings
        found=PART_RE.findall(line)
        if found:
            idx=norm_index(found[0])
            pos=''
            before=line[:line.upper().find(found[0].upper())].strip()
            if re.match(r'^[0-9A-Za-z,./\-– ]{1,18}$', before): pos=norm_index(before)
            after=line[line.upper().find(found[0].upper())+len(found[0]):]
            rec={'id': f'{idx}|{drawing_id}|{pos}', 'deviceIndex': device, 'position': pos, 'partIndex': idx, 'zun':'', 'namePl': norm_spaces(after)[:180], 'nameEn':'', 'drawingId': drawing_id, 'drawingPath': drawing_path, 'drawingTitle': title}
            # avoid ZUN-only rows
            if not idx.startswith('ZUN-'):
                parts.append(rec); previous=rec
        elif previous and in_list and line.startswith(' ') and norm_spaces(line):
            extra=norm_spaces(line)
            if len(extra)<140 and not re.search(r'^(\d+\s*)+$', extra):
                previous['namePl']=norm_spaces((previous.get('namePl','')+' '+extra))[:220]
    # dedupe
    seen=set(); out=[]
    for p in parts:
        key=(p['partIndex'], p.get('position',''), p['drawingId'])
        if key in seen: continue
        seen.add(key); out.append(p)
    return out

def text_search_blob(text, limit=5000):
    text=norm_spaces(text)
    # strip boilerplate, keep title and list area where possible
    idx=strip_accents(text).lower().find('lista czesci')
    if idx>=0: text=text[:500]+' '+text[idx:idx+limit]
    return text[:limit]

def read_pdf_text_from_zip(z, info, tmpdir):
    target=tmpdir/(hashlib.md5(info.filename.encode()).hexdigest()+'.pdf')
    with open(target,'wb') as f: f.write(z.read(info))
    try:
        res=subprocess.run(['pdftotext','-layout',str(target),'-'], capture_output=True, text=True, timeout=12, errors='replace')
        return res.stdout if res.returncode==0 else ''
    except Exception:
        return ''
    finally:
        try: target.unlink()
        except Exception: pass

def file_id(path, size):
    return hashlib.sha1((path+'|'+str(size)).encode('utf-8','ignore')).hexdigest()[:16]

def read_workbook_rows(path, sheet_name_hint=None, max_rows=None):
    rows=[]
    if not zipfile.is_zipfile(path): return rows
    with zipfile.ZipFile(path) as z:
        shared=[]
        if 'xl/sharedStrings.xml' in z.namelist():
            root=ET.fromstring(z.read('xl/sharedStrings.xml'))
            for si in root.findall('a:si', ns): shared.append(''.join(t.text or '' for t in si.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')))
        wb=ET.fromstring(z.read('xl/workbook.xml'))
        rels=ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
        ridmap={r.attrib['Id']:r.attrib['Target'].lstrip('/') for r in rels}
        target=None
        for s in wb.findall('.//a:sheet', ns):
            nm=s.attrib.get('name','')
            if sheet_name_hint is None or sheet_name_hint.lower() in nm.lower():
                rid=s.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
                target=ridmap.get(rid,'')
                if not target.startswith('xl/'): target='xl/'+target
                break
        if not target: return rows
        def colnum(ref):
            m=re.match(r'([A-Z]+)',ref); n=0
            for c in m.group(1): n=n*26+ord(c)-64
            return n-1
        def cell(c):
            t=c.attrib.get('t'); v=c.find('a:v',ns)
            if v is None:
                isel=c.find('a:is',ns)
                return ''.join(t.text or '' for t in isel.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')) if isel is not None else ''
            val=v.text or ''
            if t=='s' and val.isdigit() and int(val)<len(shared): return shared[int(val)]
            return val
        for ev,row in ET.iterparse(z.open(target), events=('end',)):
            if row.tag.endswith('row'):
                arr=[]
                cells=[]
                maxc=-1
                vals={}
                for c in row.findall('a:c',ns):
                    ci=colnum(c.attrib.get('r','A1')); vals[ci]=cell(c); maxc=max(maxc,ci)
                if maxc>=0:
                    arr=['']*(maxc+1)
                    for ci,v in vals.items(): arr[ci]=v
                    rows.append(arr)
                row.clear()
                if max_rows and len(rows)>=max_rows: break
    return rows

def load_stock_price_maps():
    price={}; stock={}
    # Baza_czesci: columns in sheet Baza części
    path='/mnt/data/Baza_czesci_PGW_GOOGLE_SHEETS_START_2026-06-03.xlsx'
    try:
        rows=read_workbook_rows(path, 'Baza części')
        header_idx=next((i for i,r in enumerate(rows) if 'Indeks części' in r), None)
        if header_idx is not None:
            hdr=[norm_spaces(x).lower() for x in rows[header_idx]]
            def ci(name):
                for i,h in enumerate(hdr):
                    if name in h: return i
                return -1
            c_idx=ci('indeks części'); c_name=ci('nazwa części'); c_price=ci('cena netto')
            for r in rows[header_idx+1:]:
                if c_idx>=0 and c_idx<len(r) and norm_spaces(r[c_idx]):
                    idx=norm_index(r[c_idx])
                    d=price.setdefault(idx,{})
                    if c_name>=0 and c_name<len(r) and norm_spaces(r[c_name]): d['name']=norm_spaces(r[c_name])
                    if c_price>=0 and c_price<len(r) and norm_spaces(r[c_price]): d['priceNet']=norm_spaces(r[c_price])
                    d['source']='Baza_czesci_PGW_GOOGLE_SHEETS_START_2026-06-03.xlsx'
    except Exception as e:
        log('price workbook error '+repr(e))
    # stock xlsm columns A,B,J,K
    try:
        rows=read_workbook_rows('/mnt/data/stan na 2026.05.29.xlsm','Arkusz1')
        for r in rows[2:]:
            if len(r)>0 and norm_spaces(r[0]):
                idx=norm_index(r[0]); name=norm_spaces(r[1]) if len(r)>1 else ''
                m102=norm_spaces(r[9]) if len(r)>9 else ''
                m105=norm_spaces(r[10]) if len(r)>10 else ''
                stock[idx]={'name':name,'mag102':m102,'mag105':m105,'source':'stan na 2026.05.29.xlsm'}
    except Exception as e:
        log('stock workbook error '+repr(e))
    return price, stock

def enrich_parts(parts, price, stock):
    for p in parts:
        idx=norm_index(p.get('partIndex',''))
        if idx in price:
            d=price[idx]
            p['priceNet']=d.get('priceNet','')
            p['priceSource']=d.get('source','')
            if not p.get('namePl') and d.get('name'): p['namePl']=d['name']
        if idx in stock:
            s=stock[idx]
            p['stock102']=s.get('mag102','')
            p['stock105']=s.get('mag105','')
            try:
                total=sum(float(str(x).replace(',','.')) for x in [s.get('mag102','0'),s.get('mag105','0')] if str(x).strip())
                p['stockTotal']=int(total) if total.is_integer() else total
            except Exception: pass
            if not p.get('namePl') and s.get('name'): p['namePl']=s['name']
    return parts

# main
if LOG.exists(): LOG.unlink()
price, stock = load_stock_price_maps()
log(f'Loaded price records={len(price)}, stock records={len(stock)}')
all_drawings=[]; all_parts=[]; seen_draw=set(); seen_file_keys=set()
archives=sorted(SRC_DIR.glob('*.zip'))
start=time.time(); processed_pdf=0
with tempfile.TemporaryDirectory(dir='/mnt/data') as td:
    tmpdir=Path(td)
    for archive in archives:
        log(f'Archive: {archive.name}')
        with zipfile.ZipFile(archive) as z:
            infos=[i for i in z.infolist() if not i.is_dir()]
            for n,info in enumerate(infos,1):
                ext=Path(info.filename).suffix.lower()
                if ext not in DRAW_EXTS and ext not in {'.docx'}: continue
                original=info.filename
                # drop noise
                if '/Thumbs.db' in original or original.endswith('Thumbs.db') or '/~$' in original: continue
                key=(Path(original).name.lower(), info.file_size)
                if key in seen_file_keys: continue
                seen_file_keys.add(key)
                device=extract_device(original)
                brand=detect_brand(original,'')
                fid=file_id(original, info.file_size)
                repo_path=url_path_for(original, device, brand, ext)
                title=Path(original).stem
                text=''; parts=[]; has_text=False
                if ext=='.pdf':
                    text=read_pdf_text_from_zip(z, info, tmpdir)
                    has_text=bool(norm_spaces(text))
                    if has_text:
                        title=title_from_text(text, original)
                        device=extract_device(title+' '+original) or device
                        brand=detect_brand(original,title) or brand
                        repo_path=url_path_for(original, device, brand, ext)
                        parts=parse_parts_from_text(text, fid, device, repo_path, title)
                    processed_pdf+=1
                    if processed_pdf % 100 == 0:
                        log(f'PDF processed {processed_pdf}, drawings {len(all_drawings)}, parts {len(all_parts)}')
                d={'id':fid,'deviceIndex':device,'brand':brand,'title':norm_spaces(title),'type':'pdf' if ext=='.pdf' else 'image' if ext in {'.png','.jpg','.jpeg','.webp','.gif','.svg','.bmp'} else 'docx','fileName':Path(original).name,'sourceArchive':archive.name,'originalPath':original,'path':repo_path,'size':info.file_size,'hasText':has_text,'searchText': text_search_blob(text) if text else ''}
                all_drawings.append(d)
                all_parts.extend(parts)

# dedupe parts by index+drawing+pos and enrich
uniq=[]; seen=set()
for p in all_parts:
    if p.get('partIndex','').upper().startswith('ZUN-'): continue
    key=(p.get('partIndex'),p.get('drawingId'),p.get('position'))
    if key in seen: continue
    seen.add(key); uniq.append(p)
all_parts=enrich_parts(uniq, price, stock)
# devices aggregate
devices={}
for d in all_drawings:
    dev=d.get('deviceIndex') or 'BEZ-INDEKSU'
    rec=devices.setdefault(dev, {'deviceIndex':dev,'brand':d.get('brand',''),'title':d.get('title',''),'drawings':[],'parts':[]})
    if not rec.get('brand') and d.get('brand'): rec['brand']=d['brand']
    rec['drawings'].append(d['id'])
for p in all_parts:
    dev=p.get('deviceIndex') or 'BEZ-INDEKSU'
    rec=devices.setdefault(dev, {'deviceIndex':dev,'brand':'','title':'','drawings':[],'parts':[]})
    rec['parts'].append(p['id'])
# write
meta={'generatedAt':time.strftime('%Y-%m-%d %H:%M:%S'),'archives':[a.name for a in archives],'drawingCount':len(all_drawings),'partCount':len(all_parts),'deviceCount':len(devices),'priceRecords':len(price),'stockRecords':len(stock),'note':'Generated from uploaded Github/ezyZip source archives. PDF text extraction with pdftotext; DOC/DOCX entries are indexed as drawings only unless converted.'}
for name,data in [('drawings.generated.json',all_drawings),('parts.generated.json',all_parts),('devices.generated.json',list(devices.values())),('build-meta.json',meta)]:
    with open(OUT_DIR/name,'w',encoding='utf-8') as f: json.dump(data,f,ensure_ascii=False,separators=(',',':'))
# report
missing_preview=[d for d in all_drawings if d['type']=='docx']
no_parts=[d for d in all_drawings if d['type']=='pdf' and not any(p['drawingId']==d['id'] for p in all_parts)]
with open(OUT_DIR/'AUDYT_DANYCH.md','w',encoding='utf-8') as f:
    f.write('# Audyt danych PGW Service Hub\n\n')
    f.write(f"- Rysunki / pliki graficzne / PDF/DOCX zaindeksowane: **{len(all_drawings)}**\n")
    f.write(f"- Części odczytane z PDF: **{len(all_parts)}**\n")
    f.write(f"- Modele / indeksy urządzeń: **{len(devices)}**\n")
    f.write(f"- Rekordy cenowe z Excela: **{len(price)}**\n")
    f.write(f"- Rekordy stanów z pliku `stan na 2026.05.29.xlsm`: **{len(stock)}**\n\n")
    f.write('## Ważne ograniczenia\n\n')
    f.write('- Same pliki PDF/JPG/PNG/DOCX nie są dołączone do lekkiej paczki wdrożeniowej — trzeba je mieć w repo w katalogu `drawings/...` albo uruchomić skrypt importujący.\n')
    f.write('- Części są odczytywane automatycznie z tekstu PDF; skany bez tekstu będą widoczne jako rysunek, ale tabela części może wymagać ręcznego dopisania.\n')
    f.write(f'- PDF-y bez rozpoznanej tabeli części: **{len(no_parts)}**.\n')
    f.write(f'- DOCX zaindeksowane jako pliki, ale bez podglądu inline: **{len(missing_preview)}**.\n')
log(f'DONE drawings={len(all_drawings)} parts={len(all_parts)} devices={len(devices)} elapsed={time.time()-start:.1f}s')

#!/usr/bin/env python3
"""
PGW Service Hub — czyszczenie publicznych danych.

Cel:
- klient widzi tylko PDF-y z Google Drive,
- bez cen, dostępności i stanów,
- bez duplikatów tego samego pliku Drive,
- bez pustych rysunków i nagłówków udających części.

Uruchom z katalogu repo:
  python3 scripts/clean-public-data.py
"""
from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Dict, Iterable, List, Tuple

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"

PRICE_STOCK_KEYS = {
    "price", "priceNet", "priceGross", "netPrice", "grossPrice", "cena", "cenaNetto", "cenaBrutto",
    "availability", "available", "stock", "stan", "qtyAvailable", "iloscDostepna", "dostepnosc",
    "availabilityStatus", "priceStatus", "warehouse", "magazyn"
}


def load(name: str) -> List[Dict[str, Any]]:
    path = DATA / name
    if not path.exists():
        return []
    value = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(value, list):
        return value
    for key in ("items", "data", "rows", "drawings", "parts", "devices", "records"):
        if isinstance(value.get(key), list):
            return value[key]
    return []


def save(name: str, rows: List[Dict[str, Any]]) -> None:
    path = DATA / name
    path.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def norm(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip().lower())


def norm_index(value: Any) -> str:
    text = str(value or "").strip().upper().replace("_", "-")
    text = re.sub(r"\s+", "-", text)
    text = re.sub(r"([A-Z]+)(\d)", r"\1-\2", text)
    return text


def is_pdf(row: Dict[str, Any]) -> bool:
    mime = norm(row.get("mimeType"))
    if "pdf" in mime:
        return True
    hay = " ".join(str(row.get(k, "")) for k in (
        "fileName", "title", "name", "url", "viewerUrl", "openUrl", "path", "originalPath", "localPath",
        "toya24AttachmentUrl", "partsPdfUrl", "toya24PdfUrl"
    ))
    return bool(re.search(r"\.pdf(?:[?#].*)?$", hay, re.I) or ".pdf" in hay.lower())


def file_id(row: Dict[str, Any]) -> str:
    return str(row.get("driveFileId") or row.get("fileId") or row.get("googleDriveId") or row.get("gdriveId") or "").strip()


def clean_sensitive(row: Dict[str, Any]) -> Dict[str, Any]:
    return {k: v for k, v in row.items() if k not in PRICE_STOCK_KEYS}


def drawing_score(row: Dict[str, Any], parts_count: Counter) -> Tuple[int, int, int, int, str]:
    """Większy wynik = lepszy rekord do zostawienia jako reprezentant PDF-a."""
    filename = str(row.get("fileName") or row.get("title") or "")
    title = str(row.get("title") or "")
    did = str(row.get("id") or "")
    has_parts = 1 if parts_count.get(did, 0) else 0
    canonical = 1 if re.search(r"czesci[_ -]?zamienne", filename, re.I) else 0
    text_len = min(len(str(row.get("searchText") or "")), 10000)
    size = int(row.get("size") or 0) if str(row.get("size") or "").isdigit() else 0
    # Stabilny tie-breaker, żeby wynik był powtarzalny.
    return (has_parts, canonical, text_len, size, title)


def dedupe_drawings(drawings: List[Dict[str, Any]], parts: List[Dict[str, Any]]):
    parts_count = Counter(str(p.get("drawingId") or "") for p in parts)
    pdf_drive = []
    removed_non_pdf_or_no_drive = []
    for d in drawings:
        fid = file_id(d)
        if fid and is_pdf(d):
            pdf_drive.append(clean_sensitive(d))
        else:
            removed_non_pdf_or_no_drive.append(d)

    groups: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for d in pdf_drive:
        groups[file_id(d)].append(d)

    kept: List[Dict[str, Any]] = []
    id_map: Dict[str, str] = {}
    duplicate_details = []

    for fid, rows in groups.items():
        rows_sorted = sorted(rows, key=lambda r: drawing_score(r, parts_count), reverse=True)
        keeper = rows_sorted[0]
        kept.append(keeper)
        keeper_id = str(keeper.get("id") or "")
        for r in rows_sorted:
            rid = str(r.get("id") or "")
            if rid:
                id_map[rid] = keeper_id
        if len(rows_sorted) > 1:
            duplicate_details.append({
                "driveFileId": fid,
                "kept": keeper.get("fileName") or keeper.get("title") or keeper_id,
                "removed": [r.get("fileName") or r.get("title") or r.get("id") for r in rows_sorted[1:]],
            })

    kept.sort(key=lambda r: (norm_index(r.get("deviceIndex")), norm(r.get("fileName") or r.get("title"))))
    return kept, id_map, removed_non_pdf_or_no_drive, duplicate_details


def clean_parts(parts: List[Dict[str, Any]], drawings_by_id: Dict[str, Dict[str, Any]], id_map: Dict[str, str]):
    cleaned = []
    removed = []
    seen = set()

    for raw in parts:
        p = clean_sensitive(dict(raw))
        old_did = str(p.get("drawingId") or "")
        new_did = id_map.get(old_did, old_did)
        drawing = drawings_by_id.get(new_did)
        if not drawing:
            removed.append(("brak publicznego rysunku", p))
            continue

        device = norm_index(p.get("deviceIndex") or drawing.get("deviceIndex"))
        part_index = norm_index(p.get("partIndex"))
        position = norm(p.get("position"))
        name_pl = norm(p.get("namePl"))
        name_en = norm(p.get("nameEn"))

        # Wiersze typu "YT-851992 - KOSIARKA" są nagłówkiem z PDF, nie częścią.
        if part_index and part_index == device and not position:
            removed.append(("nagłówek urządzenia udający część", p))
            continue

        if not part_index and not name_pl and not name_en:
            removed.append(("pusty rekord części", p))
            continue

        key = (new_did, part_index, position, name_pl, name_en)
        if key in seen:
            removed.append(("duplikat części", p))
            continue
        seen.add(key)

        p["drawingId"] = new_did
        p["deviceIndex"] = drawing.get("deviceIndex") or p.get("deviceIndex")
        p["drawingTitle"] = drawing.get("title") or p.get("drawingTitle")
        p["drawingPath"] = drawing.get("path") or p.get("drawingPath")
        p["id"] = "|".join([part_index or str(p.get("partIndex") or ""), new_did, str(p.get("position") or "")])
        cleaned.append(p)

    cleaned.sort(key=lambda p: (norm_index(p.get("deviceIndex")), str(p.get("drawingId")), str(p.get("position") or ""), norm_index(p.get("partIndex"))))
    return cleaned, removed


def clean_drive_map(rows: List[Dict[str, Any]], public_file_ids: set[str]):
    out = []
    seen = set()
    for raw in rows:
        row = clean_sensitive(dict(raw))
        fid = file_id(row)
        if not fid or fid not in public_file_ids:
            continue
        if fid in seen:
            continue
        seen.add(fid)
        row["mimeType"] = "application/pdf"
        row["viewerUrl"] = f"https://drive.google.com/file/d/{fid}/preview"
        row["openUrl"] = f"https://drive.google.com/file/d/{fid}/view"
        out.append(row)
    out.sort(key=lambda r: norm_index(r.get("deviceIndex") or r.get("fileName")))
    return out


def rebuild_devices(drawings: List[Dict[str, Any]], parts: List[Dict[str, Any]]):
    parts_by_device = defaultdict(list)
    drawings_by_device = defaultdict(list)
    for d in drawings:
        drawings_by_device[norm_index(d.get("deviceIndex"))].append(str(d.get("id")))
    for p in parts:
        parts_by_device[norm_index(p.get("deviceIndex"))].append(str(p.get("id")))

    devices = []
    for device in sorted(drawings_by_device):
        if not device:
            continue
        devices.append({
            "deviceIndex": device,
            "brand": "YATO" if device.startswith("YT-") else "",
            "title": device,
            "drawings": sorted(set(drawings_by_device[device])),
            "parts": sorted(set(parts_by_device.get(device, []))),
            "public": True,
        })
    return devices


def main() -> None:
    drawings = load("drawings.json")
    parts = load("parts.json")
    drive_map = load("drive-drawings-map.json")

    before = {
        "drawings": len(drawings),
        "parts": len(parts),
        "driveMap": len(drive_map),
    }

    clean_drawings, id_map, removed_drawings, duplicate_drawings = dedupe_drawings(drawings, parts)
    drawings_by_id = {str(d.get("id")): d for d in clean_drawings}
    clean_parts_rows, removed_parts = clean_parts(parts, drawings_by_id, id_map)

    # Po usunięciu części wyrzucamy rysunki bez żadnej części.
    public_dids = {str(p.get("drawingId")) for p in clean_parts_rows}
    clean_drawings = [d for d in clean_drawings if str(d.get("id")) in public_dids]
    drawings_by_id = {str(d.get("id")): d for d in clean_drawings}
    public_file_ids = {file_id(d) for d in clean_drawings if file_id(d)}
    clean_map = clean_drive_map(drive_map, public_file_ids)
    clean_devices = rebuild_devices(clean_drawings, clean_parts_rows)

    save("drawings.json", clean_drawings)
    save("parts.json", clean_parts_rows)
    save("devices.json", clean_devices)
    save("drive-drawings-map.json", clean_map)

    meta = {
        "version": "v40-clean-deduped",
        "mode": "drive-client-pdf-only",
        "priceAndAvailability": "removed",
        "before": before,
        "after": {
            "drawings": len(clean_drawings),
            "parts": len(clean_parts_rows),
            "devices": len(clean_devices),
            "driveMap": len(clean_map),
        },
        "removed": {
            "drawingsWithoutDrivePdf": len(removed_drawings),
            "duplicateDrawingGroups": len(duplicate_drawings),
            "parts": len(removed_parts),
        },
    }
    (DATA / "build-meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    audit_lines = [
        "# Audyt czyszczenia duplikatów — v40",
        "",
        "## Przed",
        f"- Rysunki: {before['drawings']}",
        f"- Części: {before['parts']}",
        f"- Manifest Drive: {before['driveMap']}",
        "",
        "## Po",
        f"- Rysunki PDF z Drive: {len(clean_drawings)}",
        f"- Części publiczne: {len(clean_parts_rows)}",
        f"- Modele: {len(clean_devices)}",
        f"- Manifest Drive: {len(clean_map)}",
        "",
        "## Usunięto",
        f"- Rysunki bez publicznego PDF z Drive: {len(removed_drawings)}",
        f"- Grupy powtórzonych rysunków po tym samym Drive fileId: {len(duplicate_drawings)}",
        f"- Powtórki / śmieci w częściach: {len(removed_parts)}",
        "",
        "## Powtórzone rysunki scalone po Drive fileId",
    ]
    for item in duplicate_drawings[:100]:
        audit_lines.append(f"- `{item['driveFileId']}` zostawiono: `{item['kept']}`, usunięto: {', '.join('`'+str(x)+'`' for x in item['removed'])}")
    if len(duplicate_drawings) > 100:
        audit_lines.append(f"- ... oraz {len(duplicate_drawings)-100} kolejnych grup")
    (ROOT / "AUDYT_DUPLIKATOW.md").write_text("\n".join(audit_lines) + "\n", encoding="utf-8")

    print(json.dumps(meta, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

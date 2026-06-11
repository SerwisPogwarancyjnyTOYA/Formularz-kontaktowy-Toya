#!/usr/bin/env python3
"""
PGW Service Hub — generator manifestu hostingu rysunków.

Zastosowanie 1: CDN / Cloudflare R2
  python scripts/build-drawing-hosting-manifest.py \
    --mode cdn \
    --base-url https://rysunki.example.com/ \
    --input data/drawings.json \
    --output data/drawings.generated.json

Zastosowanie 2: Google Drive
  CSV powinien mieć przynajmniej kolumnę z ID/linkiem Drive oraz nazwą/ścieżką pliku.
  python scripts/build-drawing-hosting-manifest.py \
    --mode drive \
    --drive-csv drive_export.csv \
    --input data/drawings.json \
    --output data/drawings.generated.json
"""
from __future__ import annotations
import argparse, csv, json, re, sys
from pathlib import Path
from urllib.parse import quote

ID_RE = re.compile(r"(?:/d/|id=)([-_A-Za-z0-9]{20,})")

def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", str(s or "").lower()).strip()

def encode_path(path: str) -> str:
    return "/".join(quote(part) for part in str(path).strip("/").split("/"))

def join_url(base: str, path: str) -> str:
    return base.rstrip("/") + "/" + path.lstrip("/")

def drive_id(value: str) -> str:
    value = str(value or "").strip()
    m = ID_RE.search(value)
    return m.group(1) if m else value

def load_drive_map(csv_path: Path) -> dict[str, str]:
    mapping: dict[str, str] = {}
    with csv_path.open(newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        headers = {h.lower(): h for h in (reader.fieldnames or [])}
        id_col = next((headers[k] for k in headers if k in {"id","fileid","file_id","driveid","drive_id"} or "link" in k or "url" in k), None)
        path_col = next((headers[k] for k in headers if k in {"path","ścieżka","sciezka","originalpath","original_path"}), None)
        name_col = next((headers[k] for k in headers if k in {"name","nazwa","filename","file_name"}), None)
        if not id_col:
            raise SystemExit("CSV Drive musi mieć kolumnę id/fileId/link/url.")
        if not path_col and not name_col:
            raise SystemExit("CSV Drive musi mieć kolumnę path/sciezka albo name/filename.")
        for row in reader:
            fid = drive_id(row.get(id_col, ""))
            if not fid:
                continue
            keys = []
            if path_col and row.get(path_col): keys.append(row[path_col])
            if name_col and row.get(name_col): keys.append(row[name_col])
            for key in keys:
                mapping[norm(key)] = fid
                mapping[norm(Path(key).name)] = fid
    return mapping

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--mode", choices=["cdn","drive"], required=True)
    ap.add_argument("--input", default="data/drawings.json")
    ap.add_argument("--output", default="data/drawings.generated.json")
    ap.add_argument("--base-url", default="")
    ap.add_argument("--drive-csv", default="")
    args = ap.parse_args()

    drawings = json.loads(Path(args.input).read_text(encoding="utf-8"))
    changed = 0
    missing = []

    if args.mode == "cdn":
        if not args.base_url:
            raise SystemExit("Dla --mode cdn podaj --base-url")
        for d in drawings:
            path = d.get("path") or d.get("localPath") or d.get("originalPath")
            if not path:
                missing.append(d.get("id") or d.get("title"))
                continue
            d["cdnUrl"] = join_url(args.base_url, encode_path(path))
            d["storage"] = "cdn"
            changed += 1

    if args.mode == "drive":
        if not args.drive_csv:
            raise SystemExit("Dla --mode drive podaj --drive-csv")
        mapping = load_drive_map(Path(args.drive_csv))
        for d in drawings:
            candidates = [d.get("path"), d.get("originalPath"), d.get("fileName"), Path(str(d.get("path") or "")).name]
            fid = next((mapping.get(norm(c)) for c in candidates if c and mapping.get(norm(c))), "")
            if fid:
                d["driveFileId"] = fid
                d["viewerUrl"] = f"https://drive.google.com/file/d/{fid}/preview"
                d["openUrl"] = f"https://drive.google.com/file/d/{fid}/view"
                d["storage"] = "google-drive"
                changed += 1
            else:
                missing.append(d.get("path") or d.get("fileName") or d.get("id"))

    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(drawings, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"OK: zapisano {out}")
    print(f"Podpięte rysunki: {changed}/{len(drawings)}")
    if missing:
        report = out.with_suffix(".missing.txt")
        report.write_text("\n".join(map(str, missing[:5000])), encoding="utf-8")
        print(f"Brak mapowania dla {len(missing)} rekordów. Raport: {report}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())

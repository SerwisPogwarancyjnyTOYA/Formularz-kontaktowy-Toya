#!/usr/bin/env bash
set -euo pipefail
SRC="${1:-source-docs}"
DST="${2:-assets/doc-pdf}"
mkdir -p "$DST"
if ! command -v soffice >/dev/null 2>&1; then
  if [ -x "/Applications/LibreOffice.app/Contents/MacOS/soffice" ]; then
    SOFFICE="/Applications/LibreOffice.app/Contents/MacOS/soffice"
  else
    echo "Brak LibreOffice. Zainstaluj LibreOffice albo podaj ścieżkę do soffice." >&2
    exit 1
  fi
else
  SOFFICE="soffice"
fi
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
COUNT=0
OK=0
FAIL=0
MANIFEST="reports/doc_conversion_manifest.csv"
mkdir -p reports
printf 'source_file,output_pdf,status\n' > "$MANIFEST"
while IFS= read -r -d '' f; do
  COUNT=$((COUNT+1))
  base="$(basename "$f")"
  safe="$(echo "${base%.*}" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')"
  out="$DST/$safe.pdf"
  rm -rf "$TMP"/*
  if "$SOFFICE" --headless --convert-to pdf --outdir "$TMP" "$f" >/dev/null 2>&1; then
    pdf="$(find "$TMP" -maxdepth 1 -type f -name '*.pdf' | head -1 || true)"
    if [ -n "$pdf" ]; then
      mv "$pdf" "$out"
      OK=$((OK+1))
      printf '"%s","%s",ok\n' "$f" "$out" >> "$MANIFEST"
    else
      FAIL=$((FAIL+1))
      printf '"%s","",no_pdf_created\n' "$f" >> "$MANIFEST"
    fi
  else
    FAIL=$((FAIL+1))
    printf '"%s","",conversion_failed\n' "$f" >> "$MANIFEST"
  fi
done < <(find "$SRC" -type f \( -iname '*.doc' -o -iname '*.docx' \) -print0)
echo "Znaleziono: $COUNT"
echo "PDF OK: $OK"
echo "Błędy: $FAIL"
echo "Manifest: $MANIFEST"

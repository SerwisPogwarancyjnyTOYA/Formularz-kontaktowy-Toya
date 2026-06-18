# PGW Service Hub — v66 PDF header extractor

Wersja produkcyjna oparta o v65, z dorzuconą warstwą wyciągania nazw urządzeń i części z PDF-ów.

## Co jest nowe

- Każdy rysunek z Drive nadal jest urządzeniem w bazie.
- `data/pdf-header-overrides.json` ma seed z PDF-ów, które już miały tekst w bazie.
- `data/pdf-header-extraction-queue.json` wskazuje PDF-y, które warto przepuścić przez Apps Script/OCR.
- Nowy skrypt `scripts/google-drive-pdf-header-parts-extractor.gs` tworzy arkusze robocze i eksport JSON:
  - `pdf_header_extract`
  - `pdf_parts_extract_preview`
  - `pdf_extract_errors`
  - `pdf-header-overrides.generated.json`
  - `pdf-parts-extracted.generated.json`
- Nowy skrypt lokalny `scripts/apply-pdf-header-overrides.py` scala wyeksportowany JSON z paczką strony.

## Stan seed v66

- Rysunki w bazie: 1421
- Urządzenia w bazie: 1410
- Nagłówki wyciągnięte z już dostępnego tekstu: 34
- Kolejka PDF do ekstrakcji/OCR: 1387

## Zasada

Najpierw poprawiamy nazwy urządzeń z nagłówków PDF. Dopiero potem ostrożnie przepuszczamy listy części z PDF-ów do formularza.

Klient nie widzi technicznych statusów. Jeśli część nie jest podpięta, nadal ma PDF i opis ręczny.

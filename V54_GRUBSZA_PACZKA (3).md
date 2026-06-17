# V54 — grubsza paczka do wrzucenia

Ta wersja nie jest drobnym patchem. Łączy trzy duże rzeczy:

1. Pełny manifest Drive z 1405 PDF, rozbity do 1418 wpisów modeli.
2. Kontrolowane zgadywanie marek z polami jakości: `brandConfidence`, `brandReason`, `reviewStatus`.
3. Nowy tor odczytu nagłówków PDF: `PDF_HEADER_EXTRACTOR_V54.md`, `header-review.html`, `scripts/google-drive-extract-pdf-headers.gs`, `data/pdf-header-extraction-queue.json`.

## Po co

Dla plików typu `Czesci_zamienne_53575.pdf` nazwa pliku mówi tylko numer. Prawdziwa nazwa urządzenia siedzi w nagłówku PDF. Przykład:

```text
53575 - GRZECHOTKA POWLEKANA
WYGIĘTA 1/4"
CZĘŚCI ZAMIENNE
```

Dzięki temu strona docelowo może pokazać klientowi:

```text
53575 — GRZECHOTKA POWLEKANA WYGIĘTA 1/4"
```

zamiast samego `53575`.

## Co wrzucić na GitHub

Całą zawartość paczki. PDF-y dalej zostają w Google Drive, repo trzyma tylko JSON-y i skrypty.

## Kolejny etap po wdrożeniu

Uruchomić w Apps Script:

```text
pgwHeaderReset
pgwHeaderContinue
pgwHeaderBuildJsonFile
```

Wynik wkleić/podmienić jako:

```text
data/pdf-header-overrides.json
```

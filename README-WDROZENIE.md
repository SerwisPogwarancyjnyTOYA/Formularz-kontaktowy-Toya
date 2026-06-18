# Wdrożenie v66

1. Wrzuć zawartość paczki do repo GitHub Pages.
2. Testuj z cache-busterem:

```text
https://serwispogwarancyjnytoya.github.io/Formularz-kontaktowy-Toya/?v=20260618-v66-pdf-header-extractor
```

## Ekstrakcja nagłówków z PDF-ów

Skrypt Apps Script:

```text
scripts/google-drive-pdf-header-parts-extractor.gs
```

Kolejność:

```text
pgwPdfExtractSetup
pgwPdfExtractLoadQueueFromSheet
pgwPdfExtractContinue
pgwPdfExtractContinue
...
pgwPdfExtractBuildJsonFiles
pgwPdfExtractAudit
```

Po wygenerowaniu JSON-ów pobierz `pdf-header-overrides.generated.json` i scal lokalnie:

```bash
python3 scripts/apply-pdf-header-overrides.py --input pdf-header-overrides.generated.json
```

Potem wrzuć nowe dane do repo.

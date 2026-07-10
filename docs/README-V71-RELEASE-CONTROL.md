# PGW v71 — Release Control

Większa paczka zamiast kolejnych małych patchy. v71 zostawia działanie formularza z v70, ale dodaje kontrolę wdrożenia, raport źródeł danych i bezpieczniejszy proces po konwersji PDF.

## Najważniejsze zmiany

- Panel admina z `?admin=1` pokazuje **Release score**, status i kolejne kroki.
- `window.PGW_DEBUG.getReleaseHealth()` zwraca pełny stan wdrożenia.
- Eksporty admina:
  - release-health JSON,
  - source-health CSV,
  - pdf-override-candidates CSV,
  - dotychczasowe PDF diagnostics JSON/CSV.
- Nowy skrypt Apps Script `pgw-refresh-pdf-manifest-after-conversion-v71.gs`:
  - skanuje PDF-y po konwersji,
  - robi backup wcześniej wygenerowanych JSON-ów do `data/_generated-backups`,
  - generuje `drive-drawings-map.converted.json`,
  - generuje `pdf-orphans.json`,
  - generuje `pdf-quality-report.json`,
  - generuje `pdf-override-candidates.json`,
  - generuje `deployment-state.json`,
  - generuje `release-info.json`.

## Po wdrożeniu

1. Wrzuć pliki z paczki do repo.
2. W Apps Script uruchom:

```javascript
pgwRefreshPdfManifestAfterConversionV71()
```

3. Testuj stronę:

```text
?admin=1&v=20260709-v71-release-control
```

4. W panelu PDF QA pobierz:
   - Release JSON,
   - Źródła CSV,
   - Kandydaci override CSV.

## Opcjonalny automat dzienny

```javascript
pgwInstallDailyPdfManifestRefreshV71()
```

## Rollback

Jeśli coś będzie krzyczeć, wróć do paczki v70. v71 nie zmienia schematu formularza klienta — dodaje głównie admin/release control.

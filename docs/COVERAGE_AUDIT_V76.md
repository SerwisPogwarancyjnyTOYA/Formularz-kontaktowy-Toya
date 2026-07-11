# PGW v76 — Coverage & PDF Quality Audit

Wersja: `20260711-v76-coverage-pdf-quality`  
Data: `2026-07-11T07:40:00+02:00`

## Cel

Formularz ma działać jak katalog serwisowy: klient wybiera urządzenie, widzi rysunek PDF i — jeśli mamy spis — listę części do zaznaczenia. Tryb ręczny zostaje tylko dla nowych albo brakujących urządzeń bez rysunku i bez spisu części.

## Co sprawdza v76

- czy każdy model z PDF-em na Drive może pojawić się w formularzu,
- czy PDF ma link `/preview` pod GitHub Pages,
- które modele mają PDF, ale nie mają jeszcze ustrukturyzowanych części,
- które modele mają części, ale nie mają PDF-a w manifeście Drive,
- gdzie występuje kilka kandydatów PDF i który powinien być preferowany,
- czy `__SCALONE.pdf` jest traktowane jako najlepsza wersja dla klienta.

## Wynik audytu

```json
{
  "devicesBeforeSynthetic": 1314,
  "syntheticDevicesAddedFromDrivePdf": 13,
  "devicesAfterSynthetic": 1327,
  "drawingsJsonRows": 1433,
  "partsRows": 2669,
  "drivePdfRowsTotal": 1445,
  "drivePdfModelsUnique": 1325,
  "modelsWithBestPdf": 1325,
  "modelsWithParts": 35,
  "modelsCompletePdfAndParts": 33,
  "modelsWithPdfNoStructuredParts": 1292,
  "modelsWithPartsNoDrivePdf": 2,
  "modelsFromDrivePdfWithoutDeviceRecordBeforeV76": 13,
  "pdfRowsWithoutPreviewUrl": 0,
  "modelsWithMultiplePdfCandidates": 50,
  "preferredMergedPdfModels": 12,
  "scalonePdfRows": 12
}
```

## Nowe pliki

```text
data/coverage-audit-v76.json
data/pdf-quality-audit-v76.json
data/form-catalog-policy-v76.json
scripts/pgw-v76-coverage-report.mjs
```

## Zasada publikacyjna

1. `__SCALONE.pdf` — klient widzi jako pierwszy wybór.
2. `Czesci_zamienne_<model>.pdf` — standardowy fallback.
3. rysunek techniczny/roboczy — tylko gdy nie ma nic lepszego.
4. ręczne opisanie części — awaria, nie główny tryb.

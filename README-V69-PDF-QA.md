# PGW v69 — PDF Quality Control

Wersja v69 jest kolejnym krokiem po v68. Nie usuwa mechanizmu manifestów PDF, tylko dokłada warstwę kontroli jakości:

- automatyczne generowanie `data/drive-drawings-map.converted.json`,
- lista PDF-ów bez rozpoznanego urządzenia: `data/pdf-orphans.json`,
- raport jakości: `data/pdf-quality-report.json`,
- ręczne przypisania PDF -> urządzenie: `data/pdf-device-overrides.json`,
- diagnostyka w przeglądarce przez `window.PGW_DEBUG`.

## Pliki do podmiany/dodania w repo

```text
app.js
config.js
data/pdf-device-overrides.json
data/pdf-orphans.json
data/pdf-quality-report.json
scripts/pgw-refresh-pdf-manifest-after-conversion-v69.gs
```

## Jak używać po konwersji PDF

W Apps Script uruchom:

```javascript
pgwRefreshPdfManifestAfterConversionV69()
```

Skrypt zapisze/odświeży:

```text
data/drive-drawings-map.converted.json
data/pdf-orphans.json
data/pdf-quality-report.json
```

## Ręczne przypisanie PDF-a do urządzenia

Jeżeli PDF trafi do `pdf-orphans.json`, bo ma dziwną nazwę lub brak indeksu, dopisz go w `data/pdf-device-overrides.json`.

Przykład po nazwie pliku:

```json
{
  "byFileName": {
    "dziwna_nazwa_rysunku.pdf": {
      "deviceIndex": "YT-82806",
      "deviceName": "Klucz bezszczotkowy 1/2 18V",
      "brand": "YATO",
      "notes": "Ręcznie przypisane po weryfikacji PDF."
    }
  }
}
```

Przykład po ID pliku Drive:

```json
{
  "byFileId": {
    "1abcDEF...": {
      "deviceIndex": "YT-82806",
      "brand": "YATO"
    }
  }
}
```

## Diagnostyka na stronie

Po uruchomieniu strony można w konsoli przeglądarki użyć:

```javascript
window.PGW_DEBUG.getPdfDiagnostics()
window.PGW_DEBUG.downloadPdfDiagnostics()
```

Pierwsza komenda pokaże diagnostykę w konsoli. Druga pobierze plik `pgw-pdf-diagnostics.json`.

## Co sprawdzać w raporcie

Najważniejsze pola:

- `missingModel` — PDF-y bez indeksu urządzenia,
- `notMatchedToDevice` — PDF ma indeks, ale nie pasuje do urządzeń/rysunków w bazie,
- `weakBrand` — marka wygląda na niepewną,
- `duplicateFiles` — możliwe duplikaty,
- `externalOrphans` — lista sierot wygenerowana przez Apps Script.

## Zasada bezpiecznego wdrożenia

Najpierw wrzuć pliki v69 na repo i sprawdź stronę z cache-busterem, np.:

```text
?v=20260709-v69-pdf-quality-control
```

Jeżeli formularz ładuje urządzenia i PDF-y poprawnie, uruchom Apps Script v69. Dopiero potem przeglądaj `pdf-orphans.json` i uzupełniaj override’y.

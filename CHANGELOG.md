# Changelog

## 20260711-v76-coverage-pdf-quality

- Dodano audyt pokrycia formularza: urządzenia / PDF / części.
- Dodano politykę katalogu: każde urządzenie z PDF na Drive ma być widoczne.
- Dodano raport jakości PDF i priorytet dla plików `__SCALONE.pdf`.
- Dodano syntetyczne rekordy urządzeń dla modeli, które mają PDF na Drive, ale nie miały wpisu w `devices.json`.
- Dodano skrypt `npm run coverage`.


## 20260711-v75-uniform-pdf-viewer

- Ujednolicono podgląd PDF w formularzu.
- Wymuszono linki Google Drive `/preview` do GitHub Pages iframe.
- Dodano priorytet wyboru scalonych PDF-ów `__SCALONE`.
- Dodano `data/pdf-display-policy.json` i `data/pdf-standardization-audit.json`.
- Dodano scalone PDF-y jako osobne rekordy rysunków, żeby części powiązane ze scalonym plikiem nie wypadały z formularza.
- Zasada klienta: urządzenie -> jeden najlepszy rysunek -> lista części. Tryb ręczny tylko awaryjnie.

# Changelog

## 20260710-v73-stable-control

- Dodano `admin.html` jako niezależny panel publikacyjny.
- Dodano `smoke-test.html` do szybkiego testu danych i przykładowych wyszukiwań.
- Dodano `window.PGW_DEBUG.runSmokeTest()` i eksport smoke-test JSON.
- Naprawiono brakujące akcje przycisków admina: release health, source health, override candidates.
- Dodano `scripts/pgw-repo-selfcheck.mjs` oraz `npm run check`.
- Dodano workflow `.github/workflows/static-check.yml`.
- Zaktualizowano README i dokumentację pod pełne repo publikacyjne.
- Utrzymano działające rysunki złożeniowe z manifestu pełnego i manifestu po konwersji.

## 20260710-v72-publish

- Pełne repo publikacyjne na bazie wcześniejszych patchy PDF QA i release control.

# Changelog

<<<<<<< HEAD
## 20260711-v80-drive-master-catalog

- Dodano master katalog Drive v80.
- Dodano generator `drive-parts.generated-v80.json`.
- Dodano plan scalania `drive-merge-plan-v80.json`.
- Dodano bezpieczne akcje porządkowania `drive-organizer-actions-v80.json`.
- Dodano Apps Script v80 do skanowania Drive, OCR tekstu PDF i tworzenia kopii porządkujących bez kasowania źródeł.

# Changelog

=======
>>>>>>> 430369623cb40f6169e1a404231d5cd39d752ab3
## 20260711-v79-drive-catalog-and-pdf-organizer

- Naprawiono deduplikację PDF-ów po samym `fileId` - jeden PDF może obsługiwać kilka modeli.
- Dodano `drive-drawings-map.generated-v79.json` jako manifest budowany z Drive.
- Dodano `drive-catalog-audit-v79.json`, `drive-pdf-merge-queue-v79.json`, `drive-organizer-plan-v79.json`.
- Dodano Apps Script do skanowania i porządkowania folderów Drive.
- Dodano dokumentację polityki scalania PDF.

# Changelog

## 20260711-v78-drive-first-catalog-builder

- Dodano Drive-first catalog builder.
- Dodano obsługę PDF-ów przypisanych do wielu modeli.
- Dodano generowanie części z manifestu Drive, gdy manifest zawiera tablicę `parts`.
- Dodano seed dla `YT-828113` / `YT-828114` z PDF-a `yt-828113-yt-828114.pdf`.
- Dodano skrypt lokalny oraz Apps Script do budowania manifestu z Drive.


## v77 — Smart Model Search

- Dodano inteligentne wyszukiwanie modeli po wariantach zapisu.
- `yt-828113` nie kończy już od razu jako brak urządzenia, tylko powinno pokazać bliskie modele z rysunkiem.
- Ignorowane są spacje, myślniki i typowe nadmiarowe cyfry w indeksach.
- Dodano `data/search-normalization-audit-v77.json` oraz `docs/SEARCH_STANDARD_V77.md`.

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

# Changelog

## v96 — Drawing Recovery Cleanup
- 75837 zdjęty z kolejki przeróbki po znalezieniu oficjalnego `Czesci_zamienne_75837.pdf`.
- Dodano `publication-consistency-audit-v96.json`.
- `config.js` ustawiony na strict v96 map only.
- Dodano test `pgw-v96-drawing-recovery-check.mjs`.

## v95 — Master Publication Update v83–v94
- Zintegrowano `PGW-updates-v85-v94-REGENERATED-MASTER.zip` z pełnym repo v84.
- Dodano `drive-drawings-map.generated-v95.json` jako pierwsze publiczne źródło PDF w `config.js`.
- Dodano zbiorczy patch i raport: `github-map-patch-v85-v94-master.json`, `publication-report-v85-v94-master.json`.
- Nadpisano wskazane oficjalne źródła PDF zgodnie z raportami v85–v94, m.in. korekty dla `67576`, `67574`, `67575`, `67590`, `79811`, `79943`, `73410`, `73056`, `73060`.
- Zachowano blokadę roboczych/konwertowanych PDF-ów z v83/v84.
- Dodano `npm run publication-pipeline` dla walidacji v95.


## v84 — Drive Publication Pipeline
- Wycięto fallback `drive-drawings-map.full/converted` z publicznego configu.
- Dodano publiczną mapę `drive-drawings-map.generated-v84.json`.
- Dodano kolejkę `pdf-rewrite-queue-v84.json` z pierwszą partią roboczych PDF-ów znalezionych na Drive.
- Dodano skrypt `npm run publication-pipeline`.
- Reguła: oficjalny TOYA24/Golden Sample od razu do publikacji; robocze/konwertowane tylko do przeróbki.


## v83 — Public Drawing Source Policy

- Golden Sample (`Czesci_zamienne_67576.pdf`) ustawiony jako wzorzec publikacji.
- Oficjalne `Czesci_zamienne_<MODEL>.pdf` z rysunków złożeniowych/wybuchowych mają pierwszeństwo publikacji.
- Robocze/konwertowane PDF-y trafiają do kolejki przeróbki/scalenia.
- Dodano runtime quality gate w `app.js`.
- Dodano Apps Script do skanowania Drive i generowania manifestu publicznego + kolejki poprawek.

# Changelog

## 20260711-v82-real-drawing-quality-gate

- Włączono twardy filtr PDF klienta: realny rysunek albo zweryfikowany/scalony komplet.
- Usunięto z katalogu klienta PDF roboczy `yt-828113-yt-828114.pdf`, bo zawierał tabelę/listę części zamiast prawdziwego rysunku.
- Dodano `pdf-customer-visible-blocklist-v82.json`, `pdf-quarantine-v82.json`, `real-drawing-quality-audit-v82.json`.
- Dodano test `npm run drive-quality-gate`.


## 20260711-v81-drive-search-aliases

- Drive-first katalog dostał aliasy wyszukiwania modeli.
- Dodano `drive-drawings-map.generated-v81.json` jako pierwsze źródło PDF.
- Dodano audyt `drive-master-audit-v81.json`.
- Dodano skrypty `drive-master` i `drive-alias-check`.
- Przypadki multi-model PDF, np. `YT-828113 / YT-828114`, pozostają rozbite na osobne urządzenia z tym samym PDF.

# Changelog

## 20260711-v80-drive-master-catalog

- Dodano master katalog Drive v80.
- Dodano generator `drive-parts.generated-v80.json`.
- Dodano plan scalania `drive-merge-plan-v80.json`.
- Dodano bezpieczne akcje porządkowania `drive-organizer-actions-v80.json`.
- Dodano Apps Script v80 do skanowania Drive, OCR tekstu PDF i tworzenia kopii porządkujących bez kasowania źródeł.

# Changelog

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

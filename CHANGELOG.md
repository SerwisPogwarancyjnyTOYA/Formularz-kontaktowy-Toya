
## 20260714-v83-repo-sync-ui-i18n-pdf-fixes
- Aktualizacja przygotowana do bezpośredniego wrzucenia w repozytorium Google Drive.
- Zachowano poprawione PDF-y publikacyjne z v78-v81.
- Dodano/utrzymano warstwę tłumaczeń UI PL/EN.
- Ustalono zasadę: PDF-y zostają w oryginale, części i urządzenia tłumaczone będą później osobnym słownikiem technicznym.
- Bez masowego tłumaczenia nazw części automatem.


## v82 — UI i18n foundation
- Dodano przełącznik języka strony PL/EN.
- Przetłumaczono interfejs formularza bez ruszania nazw części, urządzeń i PDF-ów.
- Dodano słownik `data/i18n-ui-v82.json` i dokumentację `docs/UI_TRANSLATION_V82.md`.
- Wygenerowany mail do serwisu pozostaje po polsku.

## 20260714-v80-official-pdf-repair-batch

- Naprawiono 3 pliki drugiego poziomu: `__SCALONE` było tylko tabelą, więc podstawiono oficjalne PDF-y z okładką, rysunkiem i listą części.
- Dodano 517 pozycji części dla YT-82173, YT-82174, YT-85485.

# Changelog — 20260711-v77-publication-quarantine-repair

## v77

- Dodano kwarantannę publikacyjną PDF.
- Dodano kolejkę napraw dla plików do scalenia, konwersji lub porównania wzrokowego.
- Frontend nie wybiera już podejrzanych PDF-ów jako primary, jeśli istnieje lepszy plik/scalony zamiennik.
- Dodano jeden preferowany PDF na model w `pdf-publication-readiness.json`.


## 20260711-v77-publication-quarantine-repair

- dodano `data/pdf-repair-candidates.json`,
- dodano `data/pdf-viewer-fallbacks.json`,
- dodano `data/model-aliases.json`,
- viewer PDF pokazuje jawne linki awaryjne dla podglądu zablokowanego przez Drive/GitHub,
- wybór PDF-a po modelu faworyzuje wersje `__SCALONE.pdf`,
- wyszukiwarka lepiej obsługuje wariantowe indeksy modeli i brak myślnika.

# Changelog

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


## 20260711-v78-fixed-bad-pdfs-pass1

- Fixed YT-55557 by merging V2/V3 sources into `assets/pdfs/Czesci_zamienne_YT-55557__SCALONE.pdf`.
- Updated drawings and publication readiness to prefer the fixed local PDF.


## v79 - bad PDF fixes YT-828

- Ustandaryzowano 11 plików PDF jako lokalne `__SCALONE` gotowe do publikacji.
- Dodano 580 pozycji części z naprawionych PDF-ów.
- Dla YT-828296 scalono dwa źródła: szlifierka prosta + szlifierka kątowa.


## 20260714-v81-false-scalone-repair
- Naprawiono fałszywie dobre / puste PDF-y: YT-85004, YT-82200, YG-09230.
- Oficjalne PDF-y promowane lokalnie jako `__SCALONE`.
- Dodano raporty `pdf-fixed-good-v81.json` i `pdf-false-scalone-v81.json`.

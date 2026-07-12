# PGW Service Hub — v96 Drawing Recovery Cleanup

Ta paczka jest pełnym repo bazującym na v84 oraz zawiera zbiorczy pakiet poprawek v85–v94.

## Najważniejsze
- `data/drive-drawings-map.generated-v95.json` — główna publiczna mapa rysunków PDF.
- `data/github-map-patch-v85-v94-master.json` — zbiorczy patch modeli gotowych do publikacji.
- `data/publication-report-v85-v94-master.json` — pełny raport z regenerowanej paczki v85–v94.
- `data/publication-report-v95.json` — raport zastosowania patcha do pełnego repo.
- `data/pdf-rewrite-queue-v95.json` — lista rzeczy do przeróbki/scalenia przed publikacją.

## Zasada
Oficjalne rysunki w stylu TOYA24 / Golden Sample idą publicznie. Robocze PDF-y, DOCX-y, pliki tymczasowe i źródła obrazów zostają poza formularzem klienta.

## Test
```bash
npm run publication-pipeline
npm run check
```


## v96 — Drawing Recovery Cleanup

- 75837 odzyskany jako oficjalny `Czesci_zamienne_75837.pdf`.
- Kolejka przeróbki oczyszczona z pozycji, które mają już publiczny PDF.
- `config.js` wskazuje wyłącznie `drive-drawings-map.generated-v96.json`.

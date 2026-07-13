# PGW Service Hub - 0.5.0-rc2 Workflow Engine

Największa zmiana od v98: pełny obieg audyt -> zlecenie naprawcze -> przebudowa -> QA -> release gate.

- `quality-center.html` - 33 modele i priorytety,
- `rebuild-studio.html` - 29 wykonywalnych zleceń, checklisty, notatki i eksport postępu,
- `gap-register.html` - porównanie TOYA24 / Drive / repo bez fałszywego wnioskowania o braku produktu,
- `npm run audit-ingest-v110` - automatyczne wciąganie kolejnych audytów,
- `npm run release-v110-check` - twarda kontrola spójności.

Publiczna mapa PDF nie jest zmieniana automatycznie. Commit i push wymagają osobnego potwierdzenia.

---

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

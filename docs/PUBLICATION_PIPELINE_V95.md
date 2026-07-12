# PGW v95 — zbiorczy update v83–v94

Wersja v95 bierze pełne repo z v84 i dokłada cały pakiet regenerowany `PGW-updates-v85-v94-REGENERATED-MASTER.zip` jako jeden spójny update.

## Co jest w środku
- `data/drive-drawings-map.generated-v95.json` — główna publiczna mapa PDF.
- `data/github-map-patch-v85-v94-master.json` — zbiorczy patch z modeli v85–v94.
- `data/publication-report-v85-v94-master.json` — pełny raport z paczki master.
- `data/publication-report-v95.json` — raport zastosowania patcha do pełnego repo.
- `data/pdf-rewrite-queue-v95.json` — kolejka plików do odtworzenia/scalenia.

## Zasada publikacji
1. Oficjalny plik `Czesci_zamienne_<MODEL>.pdf` lub zweryfikowany `__SCALONE.pdf` idzie publicznie.
2. Robocze PDF-y, DOCX-y, pliki tymczasowe i źródła obrazów nie idą na stronę klienta.
3. Materiały robocze można wykorzystać tylko do przygotowania poprawnego PDF-a w formacie Golden Sample.

## Wynik
- publiczna mapa ma `2174` rekordów,
- patch v85–v94 ma `26` modeli,
- poprawiono/ustawiono `9` rekordów względem v84,
- do ręcznej przeróbki zostaje `2` pozycja/pozycje.

## Test
```bash
npm run publication-pipeline
npm run check
```

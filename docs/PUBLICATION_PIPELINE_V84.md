# PGW v84 — Drive Publication Pipeline

Cel: publikować klientowi tylko pliki w standardzie TOYA24 / Golden Sample.

## Golden Sample
Wzorzec: `Czesci_zamienne_67576.pdf` — tytuł urządzenia, TOYA S.A., data/aktualizacja, rysunek złożeniowy oraz lista części zamiennych.

## Reguła główna
1. Oficjalny `Czesci_zamienne_<MODEL>.pdf` albo `__SCALONE.pdf` z folderu rysunków trafia do mapy publicznej.
2. Plik z folderu roboczego/konwersji jest surowcem, nie publikacją.
3. Każdy PDF z markerami `PDF roboczy wygenerowany automatycznie`, `Zrodla w folderze`, `materiał roboczy`, `OCR`, `ręczna weryfikacja` trafia do `pdf-rewrite-queue-v84.json`.

## Wynik tej partii
- public ready: 2174 rekordów
- zablokowana partia robocza: 11 rekordów
- fallback `drive-drawings-map.full/converted` został wycięty z configu, żeby nie wrócił syf po awarii primary manifestu.

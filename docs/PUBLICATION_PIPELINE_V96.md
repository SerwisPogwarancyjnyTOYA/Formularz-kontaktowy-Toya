# PGW v96 — korekta kolejki rysunków

Wersja: `20260712-v96-drawing-queue-cleanup`  
Data: `2026-07-12T10:00:13+00:00`

## Co poprawiono

- `75837` zdjęte z kolejki przeróbki, bo na Drive znaleziono oficjalny plik `Czesci_zamienne_75837.pdf`.
- Publiczny manifest ustawiono na `data/drive-drawings-map.generated-v96.json`.
- `config.js` używa wyłącznie mapy v96, bez powrotu do starszych map Drive.
- `YT-85271` zostaje w kolejce wyłącznie jako kontrola mapowania 69 pozycji z DOCX, ale sam rysunek PDF jest public-ready.

## Zasada publikacji

Oficjalny plik w stylu TOYA24 / Golden Sample trafia do GitHuba od razu. Pliki robocze i konwertowane zostają prywatne i mogą służyć tylko jako materiał do rekonstrukcji.

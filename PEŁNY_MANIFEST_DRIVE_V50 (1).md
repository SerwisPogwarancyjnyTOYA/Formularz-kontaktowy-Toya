
# Pełny manifest Drive — v50

Ta paczka ma dwa poziomy manifestu:

1. `data/drive-drawings-map.json` — aktualny manifest używany przez stronę.
2. `data/brand-index-seed-non-yato.json` — startowy seed indeksów nie-YATO znalezionych przez wyszukiwanie w Drive.

## Co zostało dodane w v50

Dodano 16 wpisów PDF-only dla marek innych niż YATO:

| Marka | Indeksy |
|---|---|
| LUND | 73060, 79004, 79024, 79096, 79098, 79106 |
| STHOR | 79005, 79030, 79095, 79108, 79119, 79140, 79151, 79354 |
| FLO | 79444, 79467 |
| VOREL | 00300, 00320, 00500, 00510, 00600, 00610, 00703, 01060, 09900 — seed lokalny do potwierdzenia |

Dla tych wpisów strona pokaże PDF i pozwoli przejść trybem opisowym, jeżeli lista części nie jest jeszcze spięta.

## Jak wygenerować pełne 1400+ PDF

1. Otwórz Google Sheets.
2. Apps Script → wklej `scripts/google-drive-export-full-manifest.gs`.
3. Uruchom `exportDrivePdfManifestV50()`.
4. Wyeksportuj arkusz `drive-drawings-map` do JSON/CSV.
5. Zamień plik `data/drive-drawings-map.json` w repo.

Ważne: pełny manifest nie zawiera PDF-ów, tylko ich ID i linki Drive. Repo zostaje lekkie.

# PGW Service Hub v51 — pełny manifest Drive

## Co rozwiązuje v51

Dotychczasowe paczki miały tylko seed / próbkę rysunków. Folder Drive `Rysunki wybuchowe` zawiera dużo większą bazę PDF, dlatego v51 dodaje eksporter z kontynuacją skanu.

## Pliki

- `scripts/google-drive-export-full-manifest.gs` — Apps Script do pełnego skanu Google Drive.
- `scripts/google-drive-export-full-manifest-paged.gs` — ten sam skrypt, zostawiony pod czytelną nazwą.
- `scripts/convert-drive-manifest-csv.py` — konwersja CSV z arkusza do JSON, gdybyś eksportował arkusz ręcznie.
- `data/drive-drawings-map.json` — seed / awaryjna próbka.
- `data/drive-drawings-map.full.json` — tutaj ma trafić pełny eksport.

## Procedura

1. Otwórz Google Sheets.
2. Rozszerzenia → Apps Script.
3. Wklej `scripts/google-drive-export-full-manifest.gs`.
4. Uruchom `pgwManifestStart()`.
5. Potem uruchamiaj `pgwManifestContinue()`, aż status pokaże `DONE`.
6. Uruchom `pgwManifestBuildJsonFile()`.
7. Pobierz utworzony JSON z Drive.
8. W repo zapisz go jako `data/drive-drawings-map.full.json`.
9. Wdróż stronę.

## Dlaczego nie robić tego ręcznie w ChatGPT Connectorze

Connector potrafi wylistować maksymalnie 1000 elementów w jednym wywołaniu. Pełna baza wymaga paginacji/kontynuacji, dlatego Apps Script jest właściwym miejscem na pełny eksport.

## Jak działa z markami

Marka jest rozpoznawana po:

- prefiksie `YT` → YATO,
- prefiksie `YG` → YATO GASTRO,
- nazwie folderu lub pliku: STHOR, VOREL, FLO, LUND, FALA,
- seedowych wyjątkach dla indeksów numerycznych.

Jeżeli marka nie jest pewna, skrypt wpisuje `INNE` i niską pewność. To jest celowe — lepiej oznaczyć do weryfikacji niż skłamać klientowi.

# PGW Service Hub v51 — pełny eksporter Drive

Wersja v51 przygotowuje stronę pod realną bazę rysunków z Google Drive.

## Najważniejsze zmiany

- strona próbuje wczytać `data/drive-drawings-map.full.json`, a potem fallback `data/drive-drawings-map.json`,
- pełny manifest może zawierać urządzenia, których nie ma jeszcze w `devices.json`,
- aplikacja tworzy lekkie rekordy urządzeń z samego manifestu Drive,
- PDF bez listy części działa w trybie opisowym,
- dodano paginowany Apps Script do skanowania folderu `Rysunki wybuchowe`,
- dodano audyt manifestu i eksport JSON.

## Wdrożenie

1. Wgraj paczkę do czystego repo.
2. Na razie strona działa na seedzie `data/drive-drawings-map.json`.
3. Uruchom eksporter z `scripts/google-drive-export-full-manifest.gs` w Google Sheets.
4. Pobierz wygenerowany JSON i zapisz jako `data/drive-drawings-map.full.json`.
5. Commit + push.

PDF-y nie trafiają do repo. Repo trzyma tylko JSON.

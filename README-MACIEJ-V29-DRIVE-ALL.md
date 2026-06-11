# PGW Service Hub v29 — Drive dla wszystkich rysunków

Ta wersja poprawia demo Google Drive i dodaje kolejne mapowanie `00703`, ale najważniejsza zmiana to proces pełny:

1. Strona korzysta z `data/drive-drawings-map.json`.
2. Ten plik ma być wygenerowany automatem `scripts/google-drive-export-full-manifest.gs`.
3. Po wygenerowaniu i wrzuceniu manifestu wszystkie rysunki znalezione w folderach Drive dostają podgląd w stronie.

Foldery źródłowe ustawione w skrypcie:

- `Rysunki wybuchowe` — `1wYvMsfwtz8jPvAaKW4W13au77lUAu3Gu`
- `Rysunki wybuchowe-Robocze` — `1IqA8x36ml6N2ml2FNy4wsl94AbIHhRXp`

## Ważne

W paczce nadal jest mały przykładowy manifest, bo pełny manifest musi zostać wygenerowany na Twoim koncie Google Drive.
Po uruchomieniu skryptu `buildPgwFullDriveManifest()` dostaniesz pełny plik `drive-drawings-map.json`; wgraj go do repo w `data/drive-drawings-map.json`.

Dopóki pełny manifest nie zostanie wygenerowany, część rysunków będzie miała przycisk „Znajdź w Google Drive” zamiast podglądu inline.

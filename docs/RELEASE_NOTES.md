# Release notes — 20260710-v72-publish

## Cel

Pełne repo gotowe do publikacji, zamiast serii małych patchy. Release zbiera wcześniejsze prace v68–v71 i porządkuje je w jedną paczkę.

## Zmiany

- Zachowano działające wyświetlanie rysunków złożeniowych PDF.
- Utrzymano ładowanie wielu manifestów PDF.
- Dodano czysty README dla repo.
- Dodano `healthcheck.html`.
- Dodano `RELEASE.json`.
- Dodano `repository-manifest.json` z sumami SHA-256.
- Dodano jeden publikacyjny skrypt Apps Script `scripts/pgw-refresh-pdf-manifest.gs` z aliasami bez wersji.
- Uporządkowano dokumenty wdrożeniowe w `docs/`.

## Test po publikacji

```text
?v=20260710-v72-publish
?admin=1&v=20260710-v72-publish
healthcheck.html
```

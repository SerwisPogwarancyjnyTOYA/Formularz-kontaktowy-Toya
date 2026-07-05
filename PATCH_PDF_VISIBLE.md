# PATCH PDF visible — 2026-07-04

Poprawka usuwa błąd, przez który rysunki z importu roboczego mogły istnieć w `drawings.json` i `assets/robocze-pdf/`, ale nie były pokazywane na stronie, jeśli nie miały osobnego wpisu w `drive-drawings-map.full.json`.

Zmiany:
- aplikacja nie usuwa rysunków tylko dlatego, że nie występują w manifestach Drive;
- `resolveDrive()` używa `viewerUrl`, `openUrl`, `path` lub `url` bezpośrednio z rekordu rysunku;
- jeśli iframe nie wstanie, użytkownik dostaje widoczny przycisk „Otwórz w nowej karcie”;
- wersja config: `20260704-pdf-visible-hotfix`.

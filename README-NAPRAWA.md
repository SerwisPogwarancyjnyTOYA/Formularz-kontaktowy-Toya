# Naprawa strony YATO Service Hub

Ta paczka przywraca działanie strony na GitHub Pages:

- `index.html` — lekka strona startowa bez wklejonych base64/fontów,
- `app.js` — właściwa aplikacja JS, zamiast przypadkowo wklejonego workflow YAML,
- `sw.js` — czyści stary cache/PWA i niczego nie przechwytuje,
- `.nojekyll` — wyłącza przetwarzanie Jekyll,
- `.github/workflows/deploy.yml` — poprawny workflow GitHub Pages.

## Co aplikacja czyta

Aplikacja próbuje kolejno odczytać:

- `parts.json` albo `data/parts.json`,
- `devices.json` albo `data/devices.json`,
- `drawings.json` albo `data/drawings.json`,
- `logos.json`, `data/logos.json`, `db-manifest.json` albo `assets/logos.json`.

Jeżeli któryś plik nie istnieje, strona dalej działa na pozostałych plikach.

## Jak wdrożyć

1. W repozytorium GitHub otwórz `index.html` i podmień całą zawartość.
2. Otwórz `app.js` i podmień całą zawartość na prawdziwy kod JS z tej paczki.
3. Podmień `sw.js` i `manifest.webmanifest`.
4. Dodaj plik `.nojekyll` w root repozytorium.
5. Dodaj workflow jako `.github/workflows/deploy.yml`.
6. W GitHub → Settings → Pages ustaw Source: GitHub Actions albo Deploy from branch `main` / `/root`.
7. Po wdrożeniu otwórz stronę z parametrem `?v=20260610-fixed`.

## Ważne

Nie usuwaj plików danych: `parts.json`, `devices.json`, `drawings.json` ani folderów z rysunkami. Ta paczka nie zawiera bazy części — ona ją odczytuje z obecnego repozytorium.

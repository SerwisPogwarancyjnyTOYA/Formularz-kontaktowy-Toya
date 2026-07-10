# Wdrożenie PGW Service Hub

## Szybka ścieżka

1. Rozpakuj paczkę release.
2. Skopiuj całą zawartość folderu do repo GitHub Pages.
3. Nie wrzucaj starego folderu `.git` z Drive, jeżeli kopiujesz ręcznie.
4. Commit: `Release 20260710-v72-publish`.
5. Otwórz stronę z `?v=20260710-v72-publish`.
6. Otwórz `healthcheck.html`.
7. Otwórz `?admin=1&v=20260710-v72-publish` i sprawdź panel.

## Kryteria zaliczenia

- `index.html`, `app.css`, `config.js`, `app.js` zwracają HTTP 200.
- Kluczowe JSON-y z `data/` zwracają HTTP 200.
- Wyszukiwarka znajduje urządzenie po indeksie.
- Dla urządzenia z PDF-em pokazuje się rysunek złożeniowy.
- Mail generuje się na `service@yato.pl`.
- Panel admina nie pojawia się bez `?admin=1`.

## Rollback

W razie problemu wróć do poprzedniego commita GitHub Pages. Dane generowane przez Apps Script mają backup w `_generated-backups`, jeżeli skrypt miał dostęp do folderu `data`.

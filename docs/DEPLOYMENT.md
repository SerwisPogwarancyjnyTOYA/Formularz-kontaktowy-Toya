# Wdrożenie PGW Service Hub — 20260710-v73-stable-control

## Ścieżka publikacji

1. Rozpakuj paczkę release.
2. Skopiuj zawartość folderu `pgw-service-hub-publish-20260710-v73` do repozytorium GitHub Pages.
3. Upewnij się, że w root repo są `index.html`, `app.js`, `config.js`, `data/`, `assets/`, `scripts/`.
4. Commit: `Release 20260710-v73-stable-control`.
5. Po publikacji testuj z cache-busterem: `?v=20260710-v73-stable-control`.

## Testy po publikacji

- `healthcheck.html?v=20260710-v73-stable-control`
- `smoke-test.html?v=20260710-v73-stable-control`
- `admin.html?v=20260710-v73-stable-control`
- `?admin=1&v=20260710-v73-stable-control`

## Lokalny test przed commitem

```bash
npm run check
```

## Kryteria OK

- Kluczowe pliki zwracają HTTP 200.
- Wyszukiwanie urządzeń działa po pełnym indeksie i bez myślnika.
- Rysunek PDF pojawia się po wyborze urządzenia.
- Mail końcowy idzie do `service@yato.pl`.
- Panel admina nie pojawia się bez `?admin=1`.
- Smoke test ma status `pass` albo maksymalnie `warning` bez błędów krytycznych.

## Rollback

Wróć do poprzedniego commita GitHub Pages. Nie mieszaj ręcznie plików v72 i v73 — wrzucaj pełny folder release.

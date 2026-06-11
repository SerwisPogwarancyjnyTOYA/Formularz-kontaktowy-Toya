# Co zmieniła wersja v25

- Dodałem `config.js` z przełącznikiem hostingu rysunków.
- Aplikacja potrafi pokazać rysunki z:
  - lokalnego repo,
  - zewnętrznego CDN/R2,
  - Google Drive preview po `driveFileId`.
- Dodałem `scripts/build-drawing-hosting-manifest.py`, żeby nie ręcznie klepać tysięcy linków.
- Repo może zostać lekkie: kod + JSON, bez tysięcy PDF/JPG.

Najważniejsze: pliki rysunków nie muszą i nie powinny siedzieć w GitHubie.

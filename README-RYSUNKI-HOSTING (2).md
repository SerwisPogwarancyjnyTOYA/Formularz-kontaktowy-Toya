# PGW Service Hub — gdzie trzymać rysunki, żeby nie zabić repo

## Decyzja techniczna

Repozytorium GitHub ma trzymać tylko:

- kod strony,
- style,
- logotypy,
- indeksy JSON: części, urządzenia, rysunki.

Rysunki/PDF/JPG/DOCX mają być poza repozytorium i ładowane przez manifest. Aplikacja v25 obsługuje trzy tryby:

1. `local` — pliki w repo, tylko do testów i małych zestawów.
2. `drive` — Google Drive preview po `driveFileId`, dobre jako etap przejściowy.
3. `cdn` — docelowo: publiczny CDN / Cloudflare R2 / hosting TOYA24.

Konfiguracja jest w `config.js`.

## Rekomendowany wariant produkcyjny

Najlepszy wariant pod wdrożenie firmowe:

`GitHub Pages / statyczna aplikacja` + `Cloudflare R2 albo firmowy hosting TOYA24 dla rysunków` + `JSON manifest z linkami`.

Czyli aplikacja działa szybko i lekko, a ciężkie PDF/JPG nie siedzą w GitHubie.

## Google Drive

Google Drive można wykorzystać testowo albo pilotażowo, jeśli folder z rysunkami będzie udostępniony jako „każdy z linkiem może wyświetlać”. Wtedy manifest dostaje `driveFileId`, a aplikacja pokazuje plik przez:

`https://drive.google.com/file/d/<ID>/preview`

To jest łatwe, ale mniej eleganckie wizualnie niż CDN i słabsze jako rozwiązanie oficjalne dla klientów.

## CDN / Cloudflare R2

Po wrzuceniu rysunków do bucketa/CDN ustaw w `config.js`:

```js
window.PGW_CONFIG = {
  storageMode: 'cdn',
  drawingsBaseUrl: 'https://adres-twojego-cdn.example.com/',
  preferExternalDrawings: true
};
```

Następnie wygeneruj manifest:

```bash
python3 scripts/build-drawing-hosting-manifest.py \
  --mode cdn \
  --base-url https://adres-twojego-cdn.example.com/ \
  --input data/drawings.json \
  --output data/drawings.generated.json
```

## TOYA24

Jeżeli TOYA24 ma API lub miejsce na statyczne pliki, docelowo najlepsze będzie:

- rysunki pod domeną firmową,
- endpoint do cen i dostępności,
- mały backend/proxy, który nie wystawia żadnych haseł ani tokenów w przeglądarce.

Statyczna strona nie powinna bezpośrednio trzymać loginów/API key do TOYA24.

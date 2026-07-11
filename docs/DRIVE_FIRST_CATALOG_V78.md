# PGW v78 — Drive-first catalog builder

Cel tej wersji: formularz ma korzystać z tego, co faktycznie jest na Google Drive, a nie tylko z ręcznie przygotowanego `devices.json`.

## Zasada

Jeżeli PDF z rysunkiem/listą części istnieje na Drive, urządzenie powinno być widoczne w formularzu. Tryb ręczny jest tylko awaryjny dla nowych urządzeń bez dokumentacji.

## Co zmienia v78

- `data/drive-drawings-map.generated-v78.json` jest dodatkowym manifestem skanu Drive.
- Jeden PDF może obsłużyć wiele modeli, np. `YT-828113` i `YT-828114`.
- `app.js` rozbija multi-model PDF-y na osobne urządzenia w formularzu.
- Jeżeli manifest zawiera `parts`, części są dopinane do urządzenia automatycznie.
- Dodany jest skrypt lokalny `scripts/pgw-v78-drive-first-catalog-builder.mjs`.
- Dodany jest Apps Script `scripts/pgw-v78-drive-folder-scan.apps-script.gs`.

## Przykład naprawiony

ToYa24 pokazuje PDF części dla `YT-828113`, a na Drive istnieje PDF `yt-828113-yt-828114.pdf`. W v78 ten PDF tworzy w formularzu dwa urządzenia: `YT-828113` oraz `YT-828114`.

## Komendy

```bash
npm run check
npm run coverage
npm run search-check
npm run drive-catalog
```

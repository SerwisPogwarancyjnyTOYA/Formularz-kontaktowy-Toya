# PGW v81 — Drive Search Aliases

Wersja: `20260711-v81-drive-search-aliases`

## Cel

Formularz ma wyszukiwać urządzenia na podstawie tego, co faktycznie istnieje na Drive w PDF-ach, a nie tylko po ręcznie przygotowanym `devices.json`.

## Co doszło

- `data/drive-drawings-map.generated-v81.json` — Drive jako pierwsze źródło rysunków.
- `data/drive-model-aliases-v81.json` — aliasy wyszukiwania modeli, np. `YT-828113`, `YT828113`, `828113`, `YT 828113`.
- `data/drive-parts.generated-v81.json` — wyciągnięte części z PDF-ów Drive do audytu i dalszego scalania.
- `data/drive-master-audit-v81.json` — raport jakości katalogu Drive.
- `scripts/pgw-v81-drive-master-catalog.mjs` — lokalny raport katalogu Drive.
- `scripts/pgw-v81-drive-alias-check.mjs` — szybki test aliasów.
- `scripts/pgw-v81-drive-master-catalog.apps-script.gs` — szablon Apps Script do skanowania Drive.

## Zasada działania

1. PDF-y z Drive tworzą urządzenia w formularzu.
2. Jeden PDF może obsługiwać wiele urządzeń.
3. Wyszukiwarka używa aliasów modeli z Drive.
4. Link do PDF musi być `/preview`, żeby GitHub Pages pokazywał podgląd.
5. Ręczny opis części jest tylko awaryjny.

## Kontrola

```bash
npm run check
npm run drive-master
npm run drive-alias-check
npm run coverage
npm run search-check
```

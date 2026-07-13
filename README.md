# PGW Service Hub — 0.4.0.v98

Wersja v98 rozwija produkcyjną linię `0.4.0.v97` bez wymiany całej pięciomegabajtowej mapy przy każdej małej partii.

## Najważniejsze zmiany

- publiczna mapa jest składana z:
  - `data/drive-drawings-map.generated-v97.json` — stabilna baza,
  - `data/drive-drawings-patch-v98.json` — mały patch przyrostowy;
- odzyskano brakujące w aktywnej mapie oficjalne modele `YT-8277905`, `YT-8277915`, `YT-8277935`;
- rozszerzono alias `YT-8281185` do wspólnego PDF-u `YT-828118 / YT-8281185`;
- 12 wcześniej sprawdzonych modeli ogrodowych otrzymało metadane `TOYA24_FULL_MATCH`, `previewPage`, liczbę stron i datę weryfikacji;
- odświeżono `admin.html`, `healthcheck.html` i `smoke-test.html`;
- dodano kontrolę `npm run release-v98-check`.

## Liczniki

- stabilna baza: 2174 rekordy PDF,
- nowe oficjalne modele: +3,
- fizyczne rekordy PDF po wydaniu: 2177,
- modele wyszukiwalne po runtime deduplikacji i rozwinięciu aliasu: 1430,
- pełna weryfikacja TOYA24 w tej partii: 15 modeli.

## Walidacja

```bash
npm run release-v98-check
npm run publication-pipeline
npm run check
```

Do formularza klienta trafiają wyłącznie oficjalne lub jednoznacznie zweryfikowane PDF-y. Pliki robocze, konwersyjne i zawierające komunikaty techniczne pozostają poza publikacją.

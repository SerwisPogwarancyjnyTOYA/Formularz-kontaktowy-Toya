# PGW Service Hub - 0.4.0.v97

Wersja przejściowa z linii 0.4 do 0.5. Runtime formularza korzysta wyłącznie z `data/drive-drawings-map.generated-v97.json`.

## Co daje v97

- odzyskane i sprawdzone strona po stronie oficjalne PDF-y dla `YT-8277905`, `YT-8277915` i `YT-8277935`;
- potwierdzony alias `YT-8281185` dla wspólnego PDF-u `YT-828118 / YT-8281185`;
- osobne metryki gotowości rysunków i kompletności danych części;
- `health`, `doctor`, release gate oraz osobny gate gotowości do 0.5;
- twardą blokadę surowych XLS/XLSM/XLSX/DOCX/ZIP, stanów magazynowych i danych klientów przed publikacją.
- naprawione 21 logicznych niespójności `hasPartsPdf` / `hasPartsList` w `devices.json`;

## Polecenia przed commitem

```bash
npm run check
npm run health
npm run doctor
npm run release-v97-check
npm run build-manifest
```

`npm run v05-readiness` ma obecnie zakończyć się błędem - pełne dane SAP/PL/EN są realnie podpięte dla 34 z 1424 urządzeń (42 urządzenia mają flagę listy, ale 8 z nich nie ma rekordów części). To miernik drogi do 0.5, a nie błąd działania formularza.

## Status

- publiczny katalog rysunków: `READY_WITH_ACKNOWLEDGED_DATA_DEBT`;
- pełny katalog TOYA24 z listami SAP/PL/EN: `NOT_READY`;
- `YT-85271`: PDF public-ready, mapowanie 69 pozycji części nadal `MANUAL_REQUIRED`.

Szczegóły: `data/catalog-readiness-v97.json`, `data/release-readiness-v97.json` oraz `docs/V97_TO_V05_MIGRATION.md`.

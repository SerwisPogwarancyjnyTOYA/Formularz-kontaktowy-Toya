# PGW v80 — Drive Master Catalog

## Sens zmiany

Formularz nie może działać tylko na ręcznie wpisanych urządzeniach. Źródłem prawdy dla rysunków jest Google Drive. Jeżeli PDF istnieje w rysunkach oficjalnych, roboczych albo w folderze po konwersji, katalog ma próbować zbudować z niego urządzenie, rysunek i listę części.

## Co generuje v80

```text
data/drive-drawings-map.generated-v80.json
data/drive-parts.generated-v80.json
data/drive-master-audit-v80.json
data/drive-merge-plan-v80.json
data/drive-organizer-actions-v80.json
```

## Priorytet dla klienta

1. `__SCALONE.pdf`
2. PDF zawierający rysunek i listę części
3. klasyczne `Czesci_zamienne_<MODEL>.pdf`
4. techniczny/roboczy PDF tylko jako zapas

## Komendy lokalne

```bash
npm run drive-master
npm run merge-plan
npm run check
```

## Zasada bezpieczeństwa

Skrypty porządkujące nie kasują oryginałów. Tworzą plan i ewentualnie kopie w folderze organizacyjnym.

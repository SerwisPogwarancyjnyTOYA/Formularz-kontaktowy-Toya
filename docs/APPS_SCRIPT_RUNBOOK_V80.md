# PGW v80 — uruchomienie Apps Script

Plik:

```text
scripts/pgw-v80-drive-master-catalog.apps-script.gs
```

Najpierw uruchom tylko podgląd:

```javascript
pgwDriveMasterCatalogV80Preview()
```

Po sprawdzeniu raportów można uruchomić kopie porządkujące:

```javascript
pgwDriveMasterCatalogV80ApplyCopies()
```

Skrypt zapisuje manifest i raporty do folderu `data` repo na Drive. Jeśli w Apps Script włączysz Advanced Google Services → Drive API, skrypt spróbuje też wyciągać tekst z PDF-ów i dzięki temu znajdzie więcej modeli oraz części.

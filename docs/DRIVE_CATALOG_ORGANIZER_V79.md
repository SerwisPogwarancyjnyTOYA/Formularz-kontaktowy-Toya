# PGW v79 - Drive catalog + porządkowanie PDF

## Cel

Formularz nie może zależeć wyłącznie od ręcznie prowadzonego `devices.json`.
Źródłem prawdy dla rysunków jest Google Drive: foldery rysunków oficjalnych, roboczych i PDF-ów po konwersji.

## Co robi v79

1. Skanuje manifesty PDF z Drive.
2. Rozpoznaje model z nazwy pliku, folderu, tytułu i - po uruchomieniu Apps Script - także z treści PDF.
3. Jeden PDF może obsługiwać kilka modeli, np. `yt-828113-yt-828114.pdf` tworzy dwa urządzenia w formularzu.
4. Naprawia błąd deduplikacji po samym `fileId` - wcześniej drugi model z tego samego PDF-a mógł znikać.
5. Buduje kolejkę scalania i porządkowania plików.

## Komendy lokalne

```bash
npm run check
npm run drive-catalog
npm run organizer-plan
```

## Apps Script

Plik:

```text
scripts/pgw-v79-drive-catalog-organizer.apps-script.gs
```

Najpierw tylko raport:

```javascript
pgwBuildDriveCatalogV79Preview()
```

Po sprawdzeniu raportu porządkowanie folderów bez kasowania plików:

```javascript
pgwBuildDriveCatalogV79ApplyOrganizer()
```

## Zasada porządkowania

- `01_PREFEROWANE_SCALONE` - docelowe PDF-y dla klienta,
- `02_DO_SCALENIA` - osobny rysunek + osobna lista części,
- `03_DUPLIKATY_WARIANTY` - `_p`, `_q`, `eng`, `Yeng`, V2/V3,
- `04_NIEPRZYPISANE` - pliki bez rozpoznanego modelu,
- `05_RAPORTY` - wygenerowane JSON/CSV.

Skrypt nie usuwa oryginałów. W trybie organizer dodaje pliki do folderów porządkujących jako dodatkową lokalizację.

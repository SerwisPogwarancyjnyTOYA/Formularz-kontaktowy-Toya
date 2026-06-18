# V65 — importer PDF części zamiennych z TOYA24 do Google Drive

Cel: znaleźć PDF-y typu **części zamienne** na TOYA24 i wrzucić je do folderu Drive `Rysunki wybuchowe`, żeby każdy produkt z rysunkiem był później widoczny w formularzu.

## Dlaczego osobny importer?

Strona GitHub Pages nie może i nie powinna scrapować TOYA24 live. Import musi iść z poziomu Apps Script / konta Google, bo tam mamy:

- dostęp do Google Drive,
- możliwość zapisu plików PDF do folderu,
- log błędów i duplikatów,
- kontrolę ręczną nad tym, co zostało pobrane.

## Folder docelowy

Importer wrzuca PDF-y do:

```text
PGW - Rysunki / Rysunki wybuchowe
```

ID folderu ustawione w skrypcie:

```text
1wYvMsfwtz8jPvAaKW4W13au77lUAu3Gu
```

## Arkusz roboczy

Skrypt korzysta z arkusza:

```text
PGW Service Hub - pelna baza TOYA24 import 2026-06-07
```

ID:

```text
1V1RTRhdGG_jfheTEz5dvdWI2mt5f3seiYwiuUBC2RZg
```

W arkuszu tworzy zakładki:

- `TOYA24_import_queue_manual` — ręczne URL-e produktów do przeskanowania,
- `TOYA24_found_parts_pdfs` — znalezione PDF-y części,
- `TOYA24_uploaded_to_drive` — PDF-y wrzucone do Drive,
- `TOYA24_import_errors` — błędy pobierania/scrapowania.

## Kolejność uruchomienia

W Apps Script wklej `scripts/toya24-drive-parts-pdf-importer.gs`, zapisz i uruchom:

```text
pgwToya24Setup
pgwToya24SeedFoundFromAttachmentsSheet
pgwToya24ScanProductsForPartsPdfs
pgwToya24UploadFoundPartsPdfsToDrive
pgwToya24Audit
```

`pgwToya24ScanProductsForPartsPdfs` i `pgwToya24UploadFoundPartsPdfsToDrive` można uruchamiać wielokrotnie. Skrypt pomija duplikaty.

## Tryb bezpieczny

W skrypcie jest parametr:

```js
DRY_RUN: false
```

Gdy ustawisz `true`, skrypt nie wrzuca plików do Drive, tylko loguje, co by zrobił.

## Po imporcie

Po wrzuceniu nowych PDF-ów do Drive trzeba ponownie uruchomić pełny manifest Drive, czyli wcześniejszy eksporter `drive-drawings-map.full.json`, a potem przebudować bazę formularza.

Zasada końcowa:

```text
PDF na Drive → urządzenie widoczne w formularzu.
```

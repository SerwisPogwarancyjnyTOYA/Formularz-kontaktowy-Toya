# PGW v83 — Public Drawing Source Policy

## Zasada nadrzędna

Publiczny formularz pokazuje klientowi wyłącznie PDF, który wygląda jak publiczny plik TOYA24: tytuł urządzenia, oznaczenie TOYA S.A., data/aktualizacja, prawdziwy rysunek złożeniowy/wybuchowy oraz lista części zamiennych.

## Golden sample

Wzorcowy plik: `Czesci_zamienne_67576.pdf`  
Drive fileId: `1_cbMX79Ul9snUhrtKcN1_UIJ3MxfZ0SL`

To jest format docelowy dla publikacji i dla plików generowanych/scalanych.

## Pliki publikowane od razu

1. Plik jest w folderze oficjalnym z rysunkami.
2. Nazwa/format przypomina `Czesci_zamienne_<MODEL>.pdf` albo zweryfikowany `__SCALONE.pdf`.
3. Plik ma realny rysunek i listę części.
4. Brak markerów roboczych.

## Pliki zakazane publicznie

Nie wolno publikować jako rysunku PDF plików, które zawierają m.in.:

- `PDF roboczy wygenerowany automatycznie`,
- `Zrodla/Źródła w folderze`,
- `materiał roboczy`,
- `oryginalne pliki robocze`,
- `Lista części nie została automatycznie odczytana`,
- samą tabelę części bez realnego rysunku.

## Flow dla rysunków roboczych/konwertowanych

1. Zidentyfikuj model/model(e) i indeksy części.
2. Znajdź źródłowy rysunek/obraz/PDF w folderze urządzenia.
3. Złóż nowy PDF w układzie Golden Sample.
4. Dopiero wtedy publikuj na GitHub Pages.

## Dane v83

- `data/drive-drawings-map.generated-v83.json` — publiczny manifest po filtrze jakości.
- `data/public-drawing-policy-v83.json` — reguły publikacji.
- `data/public-drawing-audit-v83.json` — raport.
- `data/pdf-rewrite-queue-v83.json` — kolejka plików do przeróbki/scalenia.

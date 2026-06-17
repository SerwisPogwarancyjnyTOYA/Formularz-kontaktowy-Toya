# PGW Service Hub v55 — ZUN jako części uniwersalne

## Co poprawiono

W poprzednich wersjach ZUN został błędnie potraktowany jako numer sprawy. W rzeczywistości w pliku `stan na 2026.05.29.xlsm` kolumna `ZUN` opisuje części uniwersalne / zamienniki wspólne dla wielu urządzeń.

Przykład z arkusza:

- `Z57091010` — KULKA STALOWA — `ZUN-000255`
- `Z5709209` — KULKA STALOWA — `ZUN-000255`

To oznacza: różne indeksy z różnych urządzeń wskazują na tę samą część uniwersalną.

## Nowe pliki danych

- `data/universal-parts-zun.json` — 710 części ZUN zagregowanych z arkusza `stan na`.
- `data/universal-parts-zun.csv` — wersja kontrolna do Excela.
- `data/universal-parts-zun-links.json` — pełna mapa: indeks części → ZUN → model urządzenia.
- `data/universal-parts-zun-links.csv` — płaska lista linków do kontroli.

## Wyniki importu

- ZUN: 710 unikalnych pozycji.
- Powiązania indeksów części z ZUN: 4335.
- ZUN pasujące do więcej niż jednego indeksu części: 668.
- ZUN z dopasowaniem do rysunków Drive po modelu: 636.
- ZUN z więcej niż jednym modelem urządzenia: 597.

## Jak działa na stronie

W wyszukiwarce urządzenia można wpisać:

- kod ZUN, np. `ZUN-000255`,
- indeks części z rysunku, np. `Z57091010`,
- nazwę części, np. `łożysko 607 2Z`,
- model urządzenia powiązany z częścią.

Strona pokaże osobną sekcję: **Części uniwersalne ZUN ze „stan na…”**.

Po kliknięciu `Dodaj ZUN` część trafia do koszyka jako pozycja uniwersalna. Mail prosi serwis o potwierdzenie dopasowania po modelu urządzenia / zdjęciu tabliczki, bo ZUN sam w sobie nie zastępuje identyfikacji urządzenia.

## Ważne założenie

ZUN nie jest rysunkiem i nie występuje bezpośrednio w PDF-ach złożeniowych. ZUN jest warstwą normalizacji części z arkusza `stan na`.

Dlatego architektura danych jest teraz taka:

1. `drive-drawings-map.full.json` — rysunki PDF i modele urządzeń.
2. `parts.json` — części z rysunków, tam gdzie mamy listę.
3. `universal-parts-zun.json` — uniwersalne części pasujące do wielu urządzeń.
4. `universal-parts-zun-links.json` — techniczne powiązania indeks części ↔ ZUN ↔ model.

## Co dalej

Następny krok to połączenie ZUN z ekstraktorem PDF, żeby przy wybranym urządzeniu automatycznie pokazywać:

- części z rysunku,
- plus pasujące części uniwersalne ZUN z arkusza `stan na`.

# V97 -> 0.5.0 migration plan

## Punkt wyjścia

V97 utrzymuje działający publiczny katalog PDF, ale po raz pierwszy nie miesza go z deklaracją pełnej gotowości TOYA24.

- mapa publiczna: 2177 rekordów READY;
- urządzenia w `devices.json`: 1424;
- urządzenia z powiązaną listą części: 34 (2.39%);
- części w `parts.json`: 2669;
- nierozwiązane ręczne mapowanie: `YT-85271`.

## Warstwy 0.5

1. **Canonical Model Registry** - jeden rekord kanoniczny, aliasy handlowe, modele zestawów i modele serwisowe bez powielania danych.
2. **Documentation Lifecycle** - `FOUND -> AUDITED -> REBUILD/MANUAL_REQUIRED -> FIXED -> READY -> PUBLISHED`.
3. **Parts Pipeline** - pozycja rysunku, indeks SAP, nazwa PL, nazwa EN i kontrola zgodności numeracji.
4. **Private Master Importer** - indeksy i nazwy służą do walidacji; ceny, stany i dane klientów nigdy nie przechodzą do artefaktów publicznych.
5. **One Release Gate** - aplikacja, mapa, PDF, dane części, manifest i bezpieczeństwo sprawdzane jednym poleceniem.

## Kolejność v98-v100

- **v98:** naprawa 21 niespójnych flag, ujednolicenie relacji modeli i aliasów oraz zamknięcie `YT-85271`.
- **v99:** automatyczny importer części i raport konfliktów z prywatnym masterem.
- **v100 / 0.5.0:** stabilny schemat kanoniczny, pełny release gate i migracja runtime bez historycznych wskaźników wersji.

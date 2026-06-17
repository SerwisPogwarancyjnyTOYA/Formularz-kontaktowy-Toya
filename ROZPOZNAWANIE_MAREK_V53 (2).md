# PGW Service Hub v53 — rozpoznawanie marek

W v52 pełny manifest Drive miał 1405 PDF-ów i 485 pozycji z marką `NIEZNANA`.

W v53 zrobiłem dwie rzeczy:

1. Automatycznie poprawiłem przypadki, gdzie w nazwie pliku był prefiks `YT`, ale model został wyciągnięty jako sam numer.  
   Przykład: `Czesci_zamienne_YT-828075_YT-828076.pdf` jest teraz traktowany jako PDF dla modeli `YT-828075` i `YT-828076`, marka `YATO`.
2. Resztę niepewnych pozycji oznaczyłem jako `DO ROZPOZNANIA`, zamiast udawać pewność.

## Wynik v53

- Źródłowe PDF-y: **1405**
- Wpisy manifestu po rozbiciu PDF-ów wielomodelowych: **1418**
- Automatycznie poprawione z `NIEZNANA`: **14**
- Nadal do rozpoznania: **479**

## Rozkład marek

- DO ROZPOZNANIA: 479
- FLO: 2
- LUND: 6
- STHOR: 8
- VOREL: 9
- YATO: 691
- YATO GASTRO: 223

## Jak rozpoznawać pozostałe modele

Otwórz plik:

```text
brand-review.html
```

To jest wewnętrzny ekran pomocniczy. Pozwala filtrować po modelu/zakresie, otworzyć PDF i wygenerować nadpisania marek do pliku:

```text
data/brand-resolution-overrides.json
```

Niepewne marki dalej działają w wyszukiwarce klienta. Klient zobaczy rysunek i przejdzie trybem opisowym, ale w monitorze bazy będzie widać, że marka wymaga potwierdzenia.

## Zasada bezpieczeństwa

Nie przypisujemy marek na pałę. Jeżeli brak prefiksu, folderu albo pewnego źródła, model idzie do `DO ROZPOZNANIA`.

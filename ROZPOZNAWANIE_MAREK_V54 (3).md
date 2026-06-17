# PGW Service Hub v54 — zgadywanie marek po zakresach numeracji

W v54 wszystkie wpisy, które w v53 miały status `DO ROZPOZNANIA`, dostały markę zgadywaną po zakresie numeracji.

To nie jest twarde potwierdzenie. To tryb roboczy: marka jest ustawiona tak, aby filtr strony był użyteczny dla klienta, ale w danych zostaje ślad jakości rozpoznania:

- `brandConfidence`: `guessed_high`, `guessed_medium`, `guessed_low`
- `brandReason`: opis reguły
- `brandRule`: identyfikator reguły
- `reviewStatus`: `guessed_needs_confirmation`

## Wynik

- Liczba pozycji manifestu: **1418**
- Wpisy zgadnięte z `DO ROZPOZNANIA`: **479**
- Pozostałe `DO ROZPOZNANIA`: **0**

## Rozkład marek po zgadywaniu

- YATO: 704
- YATO GASTRO: 223
- STHOR: 181
- LUND: 169
- FALA: 89
- VOREL: 28
- FLO: 24

## Zgadnięte wpisy wg marek

- STHOR: 173
- LUND: 163
- FALA: 89
- FLO: 22
- VOREL: 19
- YATO: 13

## Pewność zgadywania

- high: 229
- medium: 228
- low: 22

## Do późniejszej ręcznej weryfikacji

Najpierw sprawdzać `data/brand-low-confidence-review.v54.json` oraz `data/brand-low-confidence-review.v54.csv` — tam jest tylko **22** pozycji low-confidence.

## Zasada bezpieczeństwa

Klient widzi markę i może filtrować modele, ale my nadal wiemy, które rekordy są zgadywane. Jak później potwierdzimy markę, dodajemy ją do `data/brand-resolution-overrides.json` albo aktualizujemy reguły.

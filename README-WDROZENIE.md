# Wdrożenie PGW Service Hub v64

Ta paczka zastępuje zawartość repo produkcyjnego. Nie dorzucaj jej obok starych plików — zrób czystą podmianę zawartości repo.

## Test po wdrożeniu

Adres z cache-busterem:

```text
https://serwispogwarancyjnytoya.github.io/Formularz-kontaktowy-Toya/?v=20260618-v64-smart-catalog
```

Sprawdź:

- `YT-85003` — model z listą części i ZUN w mailu.
- `YT-828390` — relacja składnik/komplet przy pompce oleju.
- `53575` — PDF-only z nazwą z nagłówka: grzechotka powlekana wygięta 1/4.
- dowolny model PDF-only z pełnego katalogu — rysunek ma się otworzyć, a mail ma zawierać link do PDF.
- filtr marek po samych logotypach.

## Zakres bazy

- 1421 rekordów rysunków,
- 1410 unikalnych modeli/urządzeń,
- 1405 unikalnych PDF z Drive,
- 34 modeli z listą części,
- 1376 modeli PDF-only.

## Uwaga

Modele PDF-only nie mają jeszcze tabeli części w formularzu. To nie jest błąd — klient ma dostęp do rysunku i opisuje numer pozycji / część ręcznie.

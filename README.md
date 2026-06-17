# PGW Service Hub v46 — mobile parts flow

Lekka strona GitHub Pages do zapytania o części serwisu pogwarancyjnego TOYA.

## Główne zasady

- PDF-y nie są trzymane w repo — podgląd idzie z Google Drive.
- Strona pokazuje tylko części i rysunki z publicznego manifestu.
- Klient nie widzi cen ani stanów magazynowych.
- Faktura i wysyłka są opcjonalne.
- Gdy urządzenia nie ma w bazie, działa tryb ręczny.

## Co doszło w v46

- lepszy widok na telefonie,
- sticky dolny pasek z liczbą wybranych części,
- przyciski szybkiego przejścia do PDF/listy części,
- dawkowanie listy części i przycisk „Pokaż więcej części”,
- karta części na mobile zamiast ciasnej tabeli,
- poprawiony podgląd maila roboczego,
- przygotowanie pod późniejsze mapowanie pozycji na PDF.

## Wdrożenie

1. Wklej zawartość paczki do świeżego repo.
2. Commit i push na `main`.
3. GitHub Actions opublikuje stronę.

Test cache-busting:

```text
?v=20260617-v46-mobile-parts
```

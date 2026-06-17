# PGW Service Hub v48 — visual polish + dark mode

Lekka strona GitHub Pages do zapytań o części serwisu pogwarancyjnego TOYA.

## Główne zasady

- PDF-y nie są trzymane w repo — podgląd idzie z Google Drive.
- Strona pokazuje tylko części i rysunki z publicznego manifestu.
- Klient nie widzi cen ani stanów magazynowych.
- Faktura i wysyłka są opcjonalne.
- Gdy urządzenia nie ma w bazie, działa tryb ręczny.
- Tryb jasny/ciemny jest zapamiętywany w przeglądarce.

## Co doszło w v48

- przełącznik trybu jasnego/ciemnego w górnym pasku,
- automatyczne dopasowanie startowego motywu do ustawień systemowych,
- zapamiętywanie wyboru motywu w `localStorage`,
- spokojniejszy, bardziej firmowy wygląd strony,
- poprawione kontrasty kart, pól formularza, tabel i koszyka,
- mniej surowy ekran startowy i lepsze wizualne prowadzenie klienta,
- przygotowanie UI pod dalszy lifting bez mieszania w logice danych.

## Wdrożenie

1. Wklej zawartość paczki do świeżego repo.
2. Commit i push na `main`.
3. GitHub Actions opublikuje stronę.

Test cache-busting:

```text
?v=20260617-v48-dark-mode
```

# Częściowa baza danych PGW

W tej paczce dodano częściową bazę wygenerowaną lokalnie z pliku `stan na 2026.05.29.xlsm`.

## Zakres

- części: 11662
- urządzenia/grupy urządzeń: 592
- główna reguła mapowania: `ZY<model>-<pozycja>` → `YT-<model>`
- dodatkowo: ręcznie potwierdzone wpisy demonstracyjne i robocze z rozmowy.

## Ważne

Nazwy części są realne z pliku stanowego. Nazwy urządzeń dla rekordów masowych są tymczasowe, bo w pliku stanowym jest indeks części i nazwa materiału, ale nie pełna nazwa urządzenia. Po podłączeniu pełnej tabeli modeli z Google Sheets/Toya24 nazwy urządzeń zostaną podmienione.

## Zachowanie wyszukiwarki

- Indeks urządzenia działa ściśle: jeśli wpiszesz `YT-85545` i nie ma go w tej częściowej bazie, strona nie pokaże losowych wyników.
- Indeks części działa po pełnym numerze, np. `ZY828355-16A`.
- Opis części działa po nazwach, np. `uszczelka`, `filtr`, `sprężyna`, `włącznik`.

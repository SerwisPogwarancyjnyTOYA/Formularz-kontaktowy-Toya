# PGW Service Hub — smart catalog v64

Czysta wersja produkcyjna z pełną bazą rysunków. Każdy rysunek PDF z manifestu Drive jest wyszukiwalny jako urządzenie, niezależnie od marki i od tego, czy lista części jest już podpięta.

## Zakres bazy

- Rysunki w bazie: 1421
- Unikalne modele/urządzenia: 1410
- Unikalne pliki PDF z Drive: 1405
- Modele z listą części: 34
- Modele PDF-only / lista części do uzupełnienia: 1376
- Urządzenia z czytelną nazwą zamiast samego indeksu: 79

## Co poprawia v64

- Wyszukiwarka używa nie tylko `devices.json`, ale też tytułów rysunków, tekstu PDF i nazw części, gdy są dostępne.
- PDF-only nie jest traktowany jak „brak urządzenia”. Klient widzi rysunek i opisuje potrzebną pozycję.
- Mail dla PDF-only zawiera link do rysunku, a nie komunikat o braku urządzenia w bazie.
- Tytuły urządzeń są uzupełniane z rysunków i nagłówków PDF, kiedy mamy takie dane.
- Marki zgadywane niską pewnością zostają w danych wewnętrznych, ale nie są pokazywane klientowi jako pewne.

## Zasada

Masz rysunek złożeniowy → jesteś w bazie i w wyszukiwarce.
Masz listę części → klient wybiera z listy.
Nie masz listy części → klient widzi PDF i opisuje pozycję ręcznie.

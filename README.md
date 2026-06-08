# YATO Service Hub — katalog źródłowy bootstrap

Ta paczka jest krokiem od demo do pełnej bazy.

## Co jest w środku

- `assets/database.js` — wygenerowany katalog bootstrap: **36324 pozycji** i **21733 urządzeń/rodzin** z dostępnych źródeł.
- `data/catalog.generated.json` — ten sam katalog jako JSON.
- TOYA24 pozostaje źródłem głównym PDF/kart produktów.
- Drive pozostaje backupiem.
- Jeśli modelu nie ma w katalogu, strona pokazuje panel TOYA24/Drive, zamiast ściany.

## Testy

- `ZY8220011` — powinno znaleźć Kulka stalowa dla YT-82200.
- `ZY85716-52` — powinno znaleźć FILTR HEPA z listy SAP i wywnioskować model YT-85716.
- `YT-85177` — jeśli nadal nie ma w SAP/Baza części, pokaże safety-net TOYA24/Drive, nie martwy brak wyniku.

## Następny etap

Crawler TOYA24 ma uzupełnić `toya24ProductUrl` i `partsPdfUrl` dla modeli. Nie robimy tego live w GitHub Pages.

# YATO Service Hub

Kreator zapytań o części pogwarancyjne TOYA S.A. dla GitHub Pages.

Klient wyszukuje urządzenie albo indeks części, otwiera rysunek/plik części z TOYA24 lub backupu Drive, dodaje pozycje do zapytania i generuje gotową wiadomość e-mail do serwisu.

## Źródła danych

Aplikacja działa w lekkim modelu:

- **GitHub Pages** — aplikacja, wygląd i fallback katalogu,
- **Google Sheet PGW** — główna baza części i integracja TOYA24,
- **TOYA24** — główne źródło kart produktów i PDF-ów części zamiennych,
- **Google Drive** — backup rysunków/PDF-ów.

Strona próbuje pobrać publiczny eksport CSV z arkusza:

- `Baza części`,
- `TOYA24 integracja`.

Jeżeli CSV arkusza nie jest publicznie dostępny, aplikacja przechodzi na katalog wbudowany w repo.

## Ważne

Aby katalog live działał u klientów, arkusz musi umożliwiać odczyt CSV przez link lub być opublikowany do internetu. Dane klientów nie są zapisywane na serwerze — mail generuje się lokalnie w poczcie użytkownika.


## Aktualizacja 2026-06-07 — safety net TOYA24

Ta wersja nie blokuje klienta, gdy modelu nie ma jeszcze w katalogu PGW. Dla każdego wpisanego indeksu/modelu tworzy panel źródeł:
- szukanie w TOYA24,
- Google zawężone do TOYA24,
- Drive jako backup,
- możliwość przygotowania zapytania bez udawania, że rysunek jest już zmapowany.

Docelowo pełny katalog nadal generujemy z arkusza + importera TOYA24, ale strona nie może wyglądać jak martwa, gdy klient wpisze model spoza zaimportowanej bazy.


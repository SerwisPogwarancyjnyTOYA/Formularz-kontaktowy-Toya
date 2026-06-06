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

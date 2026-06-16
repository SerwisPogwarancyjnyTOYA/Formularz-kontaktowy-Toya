# PGW Service Hub — wersja demonstracyjna do akceptacji

Cel: jedno miejsce, w którym klient może znaleźć część po indeksie urządzenia, indeksie części lub nazwie, zobaczyć rysunek wybuchowy oraz przygotować zapytanie do serwisu.

## Co działa w tej wersji

- Wyszukiwanie części i urządzeń po indeksie oraz opisie.
- Pokazanie pozycji części na rysunku.
- Pokazanie elementów powiązanych z tym samym rysunkiem.
- Podgląd rysunku z Google Drive, jeśli plik ma przypięty `fileId` w manifeście.
- Wyświetlanie ceny i stanu, jeżeli dane są dostępne w bazie.
- Formularz klienta z danymi kontaktowymi, danymi do faktury i wysyłki.
- Gotowa treść zapytania tylko do skopiowania.

## Zakres pilotażu

Rysunki są tymczasowo hostowane na Google Drive, żeby nie obciążać repozytorium GitHub. Po akceptacji można przenieść hosting rysunków do TOYA24 lub firmowego CDN.

## Najważniejsza uwaga

Pełna widoczność wszystkich rysunków wymaga uzupełnienia manifestu `drive-drawings-map.json`, czyli przypisania plików Google Drive do indeksów urządzeń/rysunków.

# Dalszy rozwój bazy rysunków i części

## Najważniejsze założenie

Nie da się uczciwie obiecać, że każda część do każdego produktu będzie wyszukiwalna od razu. Do wielu urządzeń brakuje list części albo PDF-y wymagają OCR. Finalna wersja aplikacji powinna więc działać dwutorowo:

1. Jeżeli lista części jest dostępna — pokazujemy pozycje i pozwalamy dodać je do koszyka.
2. Jeżeli lista części nie jest dostępna — pokazujemy rysunek PDF i prosimy klienta o opis części lub numer pozycji z rysunku.

## Proponowany proces uzupełniania bazy

1. Zebrać wszystkie PDF/DOC/DOCX z folderów rysunków.
2. Nadać im klucz urządzenia: model, marka, nazwa pliku, źródło.
3. Dla PDF z tekstem wyciągać tabelę: `LP`, `NR SAP`, `NAME`, `NAZWA`.
4. Dla skanów bez tekstu uruchamiać OCR i odkładać wynik do kolejki weryfikacji.
5. Po weryfikacji eksportować do `data/parts.json`, `data/drawings.json` oraz `data/pdf-header-overrides.json`.
6. Nie publikować cen i stanów magazynowych w aplikacji publicznej.

## Priorytet

Najpierw poprawne wyszukiwanie urządzeń i PDF-ów. Dopiero potem masowe dopinanie list części. To ogranicza ryzyko, że klient wybierze błędną część z niezweryfikowanego OCR.

# Live katalog z Google Sheet

Strona ładuje katalog z arkusza Google przez CSV:

- `Baza części` — wszystkie indeksy części, nazwy, modele, pozycje,
- `TOYA24 integracja` — mapa model → karta TOYA24 → PDF części → backup Drive.

## Co musi być spełnione

Arkusz musi być dostępny do odczytu jako CSV z poziomu przeglądarki klienta. Najprościej: udostępnienie / publikacja arkusza do internetu.

## Zachowanie strony

1. Najpierw ładuje się katalog wbudowany w repo.
2. Potem strona próbuje pobrać arkusz live.
3. Po udanym pobraniu katalog jest podmieniany w pamięci przeglądarki.
4. Dane są cache’owane lokalnie przez kilka godzin.
5. TOYA24 jest źródłem głównym PDF-ów, Drive jest backupem.

## Wyszukiwanie

Po załadowaniu arkusza działa wyszukiwanie po:

- indeksie części,
- aliasie / indeksie alternatywnym,
- nazwie części,
- modelu urządzenia,
- pozycji z rysunku,
- nazwie urządzenia.

Jeżeli w wierszu części nie ma modelu urządzenia, strona próbuje go wywnioskować z indeksu, np. `ZY8220011` → `YT-82200`.

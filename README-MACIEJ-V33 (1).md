# PGW Service Hub v33 — tryb publiczny TOYA24-only

Ta wersja jest zawężona zgodnie z decyzją: na stronie publicznej pokazujemy tylko towar/części, które mają potwierdzony rysunek techniczny z TOYA24.

## Co usunięto z widoku publicznego

- ceny,
- dostępność/stany magazynowe,
- modele i części, które są tylko w paczkach PGW/Drive, ale nie mają potwierdzonego rysunku technicznego TOYA24,
- przykłady typu `YT-85199*`, które nie są potwierdzone w manifeście TOYA24.

## Co zostało

- wyszukiwanie po modelu, indeksie części i nazwie,
- pozycje części z rysunku,
- elementy powiązane z tym samym rysunkiem,
- podgląd oficjalnego PDF z TOYA24,
- formularz zapytania klienta do skopiowania.

## Aktualny manifest oficjalny

Na ten moment w danych połączonych jest potwierdzony ręcznie model `YT-82200` z PDF `Części zamienne YT-82200` z TOYA24. Pełną bazę rozszerza się przez uzupełnienie `data/toya24-official-drawings.json` albo wygenerowanie pełnego eksportu z TOYA24.

## Ważna zasada

Jeżeli model ma rysunek tylko na Dysku Google albo w roboczej paczce PGW, ale nie ma potwierdzonego PDF w TOYA24, nie jest pokazywany klientowi.

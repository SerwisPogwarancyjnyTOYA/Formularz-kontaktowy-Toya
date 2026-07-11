# PGW v77 — Smart Model Search

Cel: klient nie powinien trafiać od razu w tryb ręczny tylko dlatego, że przepisał model z dodatkową cyfrą, spacją albo innym separatorem.

## Poprawka

Wyszukiwarka urządzeń ignoruje teraz:
- wielkość liter,
- spacje i myślniki,
- typowe dodatkowe cyfry w indeksie,
- warianty zapisu `YT 82813`, `YT-82813`, `yt82813`.

## Przykład

Wpis:

```text
yt-828113
```

nie istnieje dokładnie w bazie, ale formularz powinien pokazać bliskie urządzenia z rysunkiem, np.:

```text
YT-82813
YT-82811
YT-828118
```

Exact match dalej ma najwyższy priorytet. Sugestie fuzzy są używane dopiero, gdy pełne dopasowanie nie wystarcza.

## Zasada serwisowa

Ręczne opisanie części jest awaryjne. Jeżeli mamy rysunek dla urządzenia lub bliskiego wariantu modelu, klient ma najpierw zobaczyć urządzenie i PDF.

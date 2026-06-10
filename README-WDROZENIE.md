# PGW Service Hub — wersja do publikacji

Ta paczka przywraca stronę jako statyczną aplikację GitHub Pages: bez backendu, bez mailto, bez generowania JSON-a dla klienta.

## Co zostało zrobione

- profesjonalny, lżejszy interfejs pod prezentację wewnętrzną,
- wyszukiwanie po indeksie części, indeksie urządzenia, nazwie PL/EN i tekście z PDF,
- podgląd PDF/JPG/PNG bezpośrednio na stronie,
- lista części z pozycją z rysunku, nazwą, stanem i ceną, jeśli cena istnieje w danych,
- generator odpowiedzi tylko jako pole tekstowe do skopiowania,
- brak agresywnego cache/service workera, który wcześniej potrafił trzymać starą wersję strony,
- indeks zbudowany z archiwów źródłowych oraz arkusza stanów.

## Liczby z audytu

Szczegóły są w pliku `AUDYT_DANYCH.md`.

## Wdrożenie na GitHub

1. W repozytorium podmień/dodaj pliki z tej paczki.
2. Wstaw oryginalne, wysokiej jakości logotypy do `assets/logos/` albo zostaw dotychczasowe pliki w root.
3. Upewnij się, że rysunki są w ścieżkach wskazanych w `data/drawings.generated.json`.
4. GitHub → Settings → Pages → Source: **GitHub Actions**.
5. Po commicie workflow `Deploy static PGW Service Hub` opublikuje stronę.

## Import rysunków z archiwów

Jeżeli masz trzy archiwa źródłowe z paczki `Github.zip/ezyZip`, uruchom lokalnie z katalogu repo:

```bash
python scripts/import-drawings-from-zips.py /ścieżka/do/folderu/z/archiwami
```

Skrypt utworzy czysty katalog `drawings/...` zgodny z manifestem. Bez fizycznych plików PDF/JPG/PNG strona pokaże dane części, ale podgląd rysunków będzie prowadził do brakujących plików.

## Uwaga o DOCX

DOCX-y są zaindeksowane jako pliki, ale klientowi najlepiej pokazywać PDF/JPG/PNG. Pliki DOCX warto przekonwertować do PDF i podmienić w manifestach, jeśli mają być widoczne bez pobierania.

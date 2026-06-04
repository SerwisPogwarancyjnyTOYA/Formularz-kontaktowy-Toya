# YATO Service Hub — kreator zapytania o części pogwarancyjne

Repozytorium zawiera statyczną aplikację HTML/CSS/JS, którą można odpalić lokalnie albo opublikować na GitHub Pages.

## Co robi aplikacja

- wyszukuje urządzenia i części po modelu, indeksie i nazwie,
- pokazuje przykładowy rysunek złożeniowy z klikalnymi pozycjami,
- dodaje części do koszyka zapytania,
- zbiera dane klienta, dane do faktury i adres wysyłki,
- generuje gotowego maila do `service@yato.pl`,
- pozwala skopiować treść zgłoszenia lub pobrać JSON.

## Jak odpalić lokalnie

Najprościej: otwórz plik `index.html` w Chrome/Edge.

Aplikacja nie wymaga serwera, konta ani bazy danych. Działa też jako prototyp offline. Funkcja `mailto:` otworzy domyślną pocztę klienta z gotowym mailem.

## Jak wrzucić na GitHub Pages

1. Utwórz nowe repozytorium na GitHubie, np. `yato-service-hub`.
2. Wrzuć wszystkie pliki z tego folderu.
3. Wejdź w **Settings → Pages**.
4. Wybierz publikację z gałęzi `main` i folder `/root`.
5. Po chwili aplikacja będzie działać pod adresem GitHub Pages.

## Dane części

Aktualnie dane są wpisane w dwóch miejscach:

- `assets/app.js` — wbudowane dane, żeby aplikacja działała po otwarciu z pliku lokalnego,
- `data/parts.json` — docelowy format bazy do automatycznego generowania z Excela.

W późniejszej wersji można przełączyć aplikację na pobieranie JSON z `data/parts.json`, jeśli będzie publikowana online.

## Ważne ograniczenia wersji MVP

- `mailto:` nie wysyła maila automatycznie; klient musi kliknąć **Wyślij** w swojej poczcie.
- `mailto:` nie dodaje załączników.
- Długie zgłoszenia mogą przekroczyć limit linku w niektórych klientach pocztowych — dlatego jest przycisk **Kopiuj treść**.
- Dane klienta nie są zapisywane w bazie ani na GitHubie.

## Następny poziom

Kiedy prototyp przejdzie testy, można dodać:

- generator JSON z aktualnego Excela,
- prawdziwe rysunki złożeniowe PNG/PDF,
- wysyłkę maili przez API,
- panel zgłoszeń,
- statusy spraw,
- historię zapytań.

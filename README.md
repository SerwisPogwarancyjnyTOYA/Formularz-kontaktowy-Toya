# Formularz zapytania o części — Serwis Pogwarancyjny TOYA/YATO

Statyczna aplikacja internetowa wspierająca przygotowanie zapytania o części zamienne do serwisu pogwarancyjnego.

Użytkownik może wyszukać urządzenie, sprawdzić dostępny rysunek techniczny, wskazać potrzebne części lub opisać je ręcznie, a następnie wygenerować gotową treść wiadomości do serwisu.

## Co robi aplikacja

- pomaga odnaleźć urządzenie po indeksie, numerze lub fragmencie nazwy;
- pokazuje dostępny rysunek techniczny PDF;
- pozwala dodać części do zapytania lub opisać brakującą część ręcznie;
- obsługuje zapytania dotyczące kilku urządzeń naraz;
- generuje uporządkowany temat i treść maila do serwisu;
- umożliwia podanie danych kontaktowych, faktury i wysyłki;
- działa jako statyczna strona GitHub Pages.

## Jak uruchomić

1. Wgraj zawartość repozytorium na GitHub.
2. Włącz publikację w **Settings → Pages**.
3. Wybierz branch, np. `main`, oraz katalog główny repozytorium.
4. Po publikacji otwórz stronę i wpisz przykładowy indeks urządzenia.

## Status projektu

Projekt jest wersją demonstracyjną przygotowaną do prezentacji funkcjonalności. Baza danych może być dalej rozwijana o kolejne rysunki, opisy i listy części.

## Kontakt

Zapytania wygenerowane przez formularz kierowane są na: `service@yato.pl`.


## Hotfix 2026-07-04 v2

Ta paczka jest pełna: zawiera `index.html`, `app.js`, `app.css`, `config.js`, `manifest.webmanifest`, katalog `data/` i `assets/`. Wprowadzono model YT-828113/YT-828114 wraz z roboczą listą 40 części z DOCX.

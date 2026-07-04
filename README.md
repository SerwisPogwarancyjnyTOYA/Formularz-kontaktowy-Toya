# PGW Service Hub — final presentation build

Statyczna aplikacja GitHub Pages dla serwisu pogwarancyjnego TOYA/YATO. Projekt pozwala klientowi wyszukać urządzenie, sprawdzić rysunek PDF, wybrać części z listy — jeśli lista jest dostępna — albo opisać część ręcznie i wygenerować gotowy mail do `service@yato.pl`.

## Co jest gotowe

- działa jako statyczna strona: `index.html` + `app.css` + `app.js` + JSON w katalogu `data/`;
- obsługuje koszyk części z wielu urządzeń;
- ma tryb awaryjny dla urządzeń bez podpiętej listy części: klient widzi PDF i może opisać część ręcznie;
- pokazuje podgląd PDF z Google Drive oraz link „otwórz w nowej karcie”;
- generuje temat i treść maila do serwisu;
- ma filtr marek, szybkie przykłady, walidację kontaktu oraz opcjonalne sekcje faktury i wysyłki;
- jest przygotowana pod prezentację: licznik bazy, przełącznik jasny/ciemny i czytelny hero.

## Stan danych w tej paczce

- urządzenia: **1410**
- rysunki PDF: **1421**
- części z list PDF: **2179**
- pozycje PDF w manifeście Drive: **1418**
- uniwersalne części ZUN: **710**
- powiązania ZUN: **4335**
- zespoły/komplety części: **13**
- ręcznie/automatycznie poprawione nagłówki PDF: **34**

## Jak wdrożyć na GitHub Pages

1. Wgraj całą zawartość tej paczki do repozytorium GitHub.
2. Upewnij się, że `index.html`, `app.js`, `app.css`, `config.js`, `manifest.webmanifest`, `data/` i `assets/` są w głównym katalogu repo.
3. W GitHubie przejdź do **Settings → Pages**.
4. Wybierz branch, np. `main`, oraz folder `/root`.
5. Po publikacji odśwież stronę i wpisz przykładowy model, np. `00300`.

## Ważne ograniczenie

To nie jest jeszcze kompletna baza części do każdego urządzenia. Aplikacja jest przygotowana tak, żeby nie ukrywać problemu: tam, gdzie nie ma listy części, użytkownik dostaje PDF i ścieżkę opisową. Dzięki temu projekt nadaje się do pokazania większej grupie, ale baza nadal powinna być rozwijana przez OCR/import list części z kolejnych PDF-ów.

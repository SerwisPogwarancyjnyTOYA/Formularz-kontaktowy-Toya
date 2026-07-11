# Release notes - v74 Toya24 coverage + parts

## Cel

Formularz ma działać jako katalog urządzeń z rysunkami, nie jako wycinek najłatwiej rozpoznanych PDF-ów.

## Zasady v74

- każde urządzenie z rysunkiem PDF w Drive ma być dostępne w formularzu,
- każdy rekord urządzenia w formularzu musi mieć przypięty PDF,
- jeśli istnieje scalony PDF z rysunkiem i listą części, ma pierwszeństwo,
- opis ręczny jest trybem awaryjnym dla nowych/brakujących urządzeń bez rysunku i bez listy części,
- części z list PDF są wyciągane do `parts.json`, żeby klient mógł wybierać pozycje zamiast opisywać je ręcznie.

## Zmiany danych

- dodano/zweryfikowano scalone PDF-y dla frytkownic 67570-67576 oraz 67590,
- dodano 490 pozycji części `Z675xx-...` dla tych frytkownic,
- zaktualizowano `drive-drawings-map.converted.json`,
- dodano `data/parts-generated-report.json`,
- dodano `data/catalog-coverage-v74.json`.

# Release notes — 20260710-v73-stable-control

## Charakter release

Pełne repo publikacyjne typu stable-control. To nie jest mały patch — paczka zawiera całą stronę, dane, dokumentację, testy statyczne i narzędzia admina.

## Najważniejsze zmiany

- Zachowano widoczne rysunki złożeniowe PDF.
- Dodano `admin.html` jako szybki panel kontroli po publikacji.
- Dodano `smoke-test.html` do testu danych i przykładowych wyszukiwań.
- Dodano lokalny self-check i workflow GitHub Actions.
- Poprawiono panel admina: przyciski release/source/candidates mają podpięte akcje.
- Uporządkowano README i dokumentację.

## Test

```text
?v=20260710-v73-stable-control
?admin=1&v=20260710-v73-stable-control
healthcheck.html?v=20260710-v73-stable-control
smoke-test.html?v=20260710-v73-stable-control
admin.html?v=20260710-v73-stable-control
```

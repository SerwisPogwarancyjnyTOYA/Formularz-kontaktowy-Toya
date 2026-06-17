# V56 — automatyczne ZUN-y w mailu

## Założenie

ZUN nie jest modelem urządzenia ani rysunkiem złożeniowym. ZUN to część uniwersalna / zamiennik ze źródła `stan na 2026.05.29.xlsm`, która może pasować do wielu indeksów części i wielu urządzeń.

Klient nie musi wiedzieć, co to jest ZUN. Formularz ma sam dopisać ZUN-y do maila wtedy, gdy wybrana część z rysunku ma powiązanie w bazie `stan na...`.

## Co robi aplikacja

1. Klient wybiera urządzenie i część z listy.
2. Aplikacja bierze indeks części, np. `ZY827791-10`.
3. Szuka tego indeksu w `data/universal-parts-zun-links.json`.
4. Jeśli znajdzie powiązanie, dopisuje do maila ZUN, nazwę, specyfikację i poziom pewności.
5. Obsługa serwisu widzi gotowy blok w mailu i nie musi ręcznie sprawdzać ZUN-ów.

## Blok w mailu

W mailu pojawia się sekcja:

```text
Informacja dla serwisu — ZUN-y dopasowane automatycznie ze „stan na 2026.05.29”:
1. ZUN-000011 — dla wybranej części ZY827791-10 — ŁOŻYSKO KULKOWE 625; pewność: wysoka
Uwaga: ZUN jest informacją pomocniczą dla obsługi. Proszę finalnie potwierdzić zgodność w SAP/stanach przed wyceną.
```

## Widoczność dla klienta

ZUN-y nie są wymagane od klienta. Wyniki ZUN w wyszukiwarce pokazują się tylko wtedy, gdy ktoś świadomie wpisze:

- `ZUN-...`,
- indeks części zaczynający się od `Z...`,
- techniczną nazwę typu `łożysko`, `o-ring`, `szczotki`.

Samo wpisanie modelu urządzenia nie zasypuje klienta wynikami ZUN.

## Dane

- `data/universal-parts-zun.json` — lista ZUN-ów z agregacją.
- `data/universal-parts-zun-links.json` — dokładna mapa indeks części → ZUN.
- `data/auto-zun-mail-coverage.v56.json` — audyt dopasowań z części publicznych.
- `data/auto-zun-mail-coverage.v56.csv` — wersja do kontroli w arkuszu.

## Uwaga

Dopasowanie wysokiej pewności oznacza dokładny indeks części z `stan na...`. Dopasowania heurystyczne po nazwie/specyfikacji mogą być dodane później, ale powinny być oznaczane jako średnia/niska pewność.

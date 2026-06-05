# YATO Service Hub — kreator zapytania o części pogwarancyjne

Statyczna aplikacja HTML/CSS/JS do GitHub Pages. Klient wyszukuje urządzenie lub część, widzi rysunek złożeniowy, dodaje części do zapytania i generuje gotowego maila do serwisu.

## Co jest w tej aktualizacji

- podmienione logotypy marek z paczki Drive: YATO, VOREL, STHOR, LUND, FLO, FALA,
- usunięty POWER UP z widoku marek,
- dodana docelowa struktura folderów `drawings/`,
- dodany plik `data/logos.json`,
- rozbudowany `data/drawings.json` o pola `localPath`, `driveViewUrl`, `drivePreviewUrl`,
- formularz potrafi wyświetlać rysunek PDF/obraz w środku strony,
- Drive zostaje jako fallback: przycisk „Otwórz z Drive”.

## Publikacja na GitHub Pages

1. Skopiuj zawartość tej paczki do repozytorium.
2. Zrób commit, np. `foundation: logos and drawings structure`.
3. Wypchnij na GitHuba.
4. GitHub Pages powinien przebudować stronę automatycznie.

## Testy wyszukiwarki

Wpisz w formularzu:

- `YT-84920` — demo klikalnego rysunku,
- `YT-828390` — test rysunku z indeksu Drive,
- `YT-8277905`,
- `YT-852371`,
- `YG-03395`,
- `ZG03395-13`.

## Rysunki lokalne

Docelowo rysunki wrzucamy do:

```text
drawings/YATO/YT/YT-828390.pdf
drawings/YATO/YG/YG-03395.pdf
drawings/VOREL/...
drawings/STHOR/...
drawings/LUND/...
drawings/FLO/...
drawings/FALA/...
drawings/unmapped/...
```

Na razie foldery mają pliki `.gitkeep`, żeby struktura istniała w repo.

## Dane klientów

Aplikacja nie zapisuje danych klientów na serwerze. Przycisk „Generuj maila” otwiera domyślną pocztę klienta przez `mailto:`.


## Aktualizacja logo 2026-06-04
Logotypy marek są w `assets/logos/` i są używane bezpośrednio na stronie. POWER UP nie jest używany.

## Hotfix 2026-06-04 — logo w nagłówku

Nagłówek strony używa teraz właściwego logotypu YATO z pliku `assets/logos/yato-official.png`, zamiast tymczasowego czerwonego badge'a tekstowego.

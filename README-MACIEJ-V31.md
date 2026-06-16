# PGW Service Hub v31 — wersja prezentacyjna, nie tylko kosmetyka

Ta wersja porządkuje aplikację pod pokaz klientowi / dyrektorowi.

## Najważniejsze zmiany

- Dodany pasek wartości: co klient realnie zrobi na stronie.
- Start pokazuje sprawdzone przykłady z przypiętym Google Drive, a wyniki z podglądem dostają wyższy priorytet.
- Wyniki mają oznaczenia: `podgląd Drive`, `do podpięcia`, `cena w bazie`.
- Po kliknięciu wynik automatycznie pokazuje pierwszy pasujący rysunek, żeby prawa kolumna nie wyglądała martwo.
- Dodany koszyk / lista „Wybrane części do zapytania”.
- Można usuwać części z zapytania i zmieniać ilość.
- Formularz pamięta dane klienta w przeglądarce, żeby nie wpisywać ich od nowa przy każdym odświeżeniu.
- Treść maila jest zapytaniem od klienta do serwisu, bez otwierania poczty i bez JSON.
- Komunikat o braku Drive ID jest teraz neutralny i prezentacyjny: nie wygląda jak awaria strony.
- Dodano kolejne mapowania Google Drive dla modeli pokazowych i częściej trafianych wyników: YT-851990, YT-851991, YT-851992, YT-851993, YT-82003, YT-85003, YT-17003.

## Nadal potrzebne do pełnej produkcji

Pełny manifest Google Drive dla wszystkich rysunków:

```text
data/drive-drawings-map.json
```

Skrypt do jego wygenerowania jest w:

```text
scripts/google-drive-export-full-manifest.gs
```

Dopóki pełny manifest nie zostanie wygenerowany, część wyników będzie miała status `do podpięcia`, ale wyszukiwanie części, pozycje z rysunku i formularz zapytania działają.

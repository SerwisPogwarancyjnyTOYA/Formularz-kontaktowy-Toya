# Standard rysunków PDF w formularzu PGW

Celem jest prosty i pełny katalog serwisowy: klient wybiera urządzenie, widzi jednolity podgląd rysunku i wybiera część z listy.

## Co klient ma widzieć

- jedno urządzenie jako kartę serwisową,
- jeden najlepszy rysunek PDF,
- listę części, jeśli da się ją odczytać z PDF,
- przycisk otwarcia PDF w nowej karcie jako zapas.

## Priorytet PDF

1. `__SCALONE` - rysunek + lista części w jednym pliku.
2. `Czesci_zamienne_<indeks>.pdf` - standardowy PDF z listą części.
3. techniczny PDF źródłowy, tylko gdy nie ma scalonego/standardowego.
4. pliki `_p`, `_q`, `eng`, `Yeng`, `DO_WERYFIKACJI` - nie jako pierwszy wybór dla klienta.

## GitHub Pages

Do osadzania PDF używamy Google Drive `/preview`, nie `/view`. Formularz normalizuje linki automatycznie i pokazuje je w stałej ramce `.standard-pdf-viewer`.

## Jakość

Ważne minimum dla każdego urządzenia:

- urządzenie ma rysunek PDF,
- PDF ma `viewerUrl` z `/preview`,
- PDF ma `openUrl` do nowej karty,
- jeśli spis części istnieje, części są dostępne w formularzu,
- scalony PDF wygrywa z osobnymi roboczymi plikami.

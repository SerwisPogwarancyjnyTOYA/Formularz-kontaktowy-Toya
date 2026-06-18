# V66 — PDF header + parts extractor

Ta wersja przygotowuje produkcyjny tor pod wyciąganie danych z PDF-ów.

## Po co

W bazie jest ponad 1400 rysunków. Duża część ma sam numer modelu. PDF-y zwykle mają nagłówek typu:

```text
53575 - GRZECHOTKA POWLEKANA WYGIĘTA 1/4"
CZĘŚCI ZAMIENNE
```

To trzeba wykorzystać.

## Co robi skrypt Apps Script

`scripts/google-drive-pdf-header-parts-extractor.gs`

1. Bierze kolejkę PDF-ów.
2. Konwertuje PDF do tymczasowego Google Docs z OCR.
3. Czyta pierwsze linie.
4. Wyciąga model + nazwę urządzenia.
5. Robi preview tabel części.
6. Eksportuje JSON-y:
   - `pdf-header-overrides.generated.json`
   - `pdf-parts-extracted.generated.json`

## Bezpieczna zasada

Nagłówki z wysoką pewnością można od razu wpuścić do produkcji.
Części z PDF-ów na razie są `preview`, bo tabele bywają połamane i trzeba je obejrzeć przed publikacją.

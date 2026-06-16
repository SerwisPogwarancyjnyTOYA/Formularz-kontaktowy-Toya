# PGW Service Hub v29 — pełny manifest Google Drive

Ta wersja nie mapuje rysunków ręcznie. Zamiast tego dodaje mechanizm masowego przypięcia wszystkich rysunków z Google Drive.

## Co trzeba zrobić

1. Wejdź w Google Apps Script.
2. Wklej zawartość pliku:
   `scripts/google-drive-export-full-manifest.gs`
3. Uruchom funkcję:
   `buildPgwFullDriveManifest()`
4. Skrypt utworzy na Dysku plik:
   `drive-drawings-map.json`
5. Pobierz ten plik i wrzuć go do repozytorium jako:
   `data/drive-drawings-map.json`
   oraz opcjonalnie jako:
   `drive-drawings-map.json`
6. Zrób commit i deploy GitHub Pages.

## Ważne

Dla klienta spoza firmy pliki PDF/JPG/DOCX na Google Drive muszą mieć dostęp „każdy z linkiem może wyświetlać”.
W skrypcie jest przełącznik:

```js
const PGW_MAKE_FILES_PUBLIC = false;
```

Ustaw `true` tylko wtedy, gdy rysunki mogą być publicznie dostępne przez link.

## Co robi strona

Strona bierze dane z bazy części i dopina rysunki po:
- indeksie urządzenia,
- nazwie pliku,
- ścieżce pliku,
- tytule rysunku,
- wariantach z rozszerzeniem i bez rozszerzenia.

Czyli po wygenerowaniu pełnego manifestu nie trzeba ręcznie dopisywać 4–5 tysięcy plików.

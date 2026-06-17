# Wdrożenie v51

## Test URL

```text
https://serwispogwarancyjnytoya.github.io/Formularz-kontaktowy-Toya/?v=20260617-v51-full-drive-exporter
```

## Kolejność pracy

1. Wgraj v51 do świeżej historii repo.
2. Sprawdź, czy strona działa na obecnym seedzie.
3. Uruchom Apps Script z `scripts/google-drive-export-full-manifest.gs`.
4. Po zakończeniu skanu zapisz JSON jako `data/drive-drawings-map.full.json`.
5. Odśwież stronę z parametrem cache, np. `?v=manifest-full-001`.

## Uwaga

Jeżeli `drive-drawings-map.full.json` nie istnieje, strona automatycznie ładuje mniejszy `drive-drawings-map.json`.


## Aktualizacja v52 — pełny manifest Drive

Paczka zawiera `data/drive-drawings-map.full.json` z **1405 PDF-ami** wygenerowanymi z Google Drive. Strona ładuje pełny manifest jako pierwsze źródło rysunków, a seed `drive-drawings-map.json` zostaje jako fallback.

## Rozpoznawanie marek — v53

Po wrzuceniu paczki na GitHub Pages można otworzyć wewnętrznie:

```text
/brand-review.html
```

Ten ekran nie zapisuje sam plików w repo. Służy do przeglądania modeli `DO ROZPOZNANIA`, otwierania PDF-ów i generowania JSON-a z potwierdzonymi markami.

Wygenerowany JSON należy wkleić do:

```text
data/brand-resolution-overrides.json
```

Potem strona klienta automatycznie zastosuje te nadpisania przy ładowaniu danych.


## v54 — zgadywanie marek

Wersja v54 przypisała zgadywane marki do 479 rekordów wcześniej oznaczonych jako `DO ROZPOZNANIA`. W manifestach zachowano pola jakości: `brandConfidence`, `brandReason`, `reviewStatus`. Najpierw weryfikować plik `data/brand-low-confidence-review.v54.csv`.


## Dodatkowy etap po V54 — nagłówki PDF

Po wdrożeniu strony możesz odpalić ekstraktor nagłówków PDF w Apps Script. Wynikowy JSON należy zapisać jako:

```text
data/pdf-header-overrides.json
```

Strona v54 umie już wczytać ten plik i używać nazw urządzeń wyciągniętych z PDF-ów.

## Wdrożenie v55

Po wrzuceniu paczki sprawdź w wyszukiwarce:

- `ZUN-000003`
- `łożysko 607 2Z`
- `Z57091010`

Powinna pojawić się sekcja „Części uniwersalne ZUN ze stan na…”.

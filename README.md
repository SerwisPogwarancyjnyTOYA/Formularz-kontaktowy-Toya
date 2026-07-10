# PGW Service Hub — Formularz zapytania o części

Publikacyjna paczka formularza dla serwisu pogwarancyjnego TOYA. Strona działa jako statyczna aplikacja GitHub Pages: klient wyszukuje urządzenie, widzi rysunek złożeniowy PDF, wybiera lub opisuje część i otrzymuje gotową treść maila do `service@yato.pl`.

## Co zawiera release

- wyszukiwarkę urządzeń i rysunków złożeniowych PDF,
- obsługę wielu źródeł manifestów PDF: baza pełna + manifest po konwersji,
- koszyk części z grupowaniem per urządzenie,
- tryb ręcznego opisu części, gdy lista pozycji nie jest jeszcze podpięta,
- generowanie maila bez cen i bez stanów magazynowych,
- panel administracyjny pod `?admin=1`,
- diagnostykę źródeł danych, PDF-ów, sierot i override’ów,
- skrypt Apps Script do odświeżania manifestu PDF po konwersji.

## Najważniejsze pliki

```text
index.html                         główna strona
app.css                            style
config.js                          konfiguracja źródeł danych
app.js                             logika formularza i panelu admina
data/*.json                        baza urządzeń, części, PDF i raporty QA
assets/logos/*.png                 logotypy marek
scripts/pgw-refresh-pdf-manifest.gs skrypt po konwersji PDF
healthcheck.html                   szybki test publikacji
```

## Publikacja na GitHub Pages

1. Wgraj zawartość tego folderu do głównego katalogu repozytorium GitHub Pages.
2. W commit message użyj np. `Release 20260710-v72-publish`.
3. Po publikacji otwórz stronę z cache-busterem:

```text
?v=20260710-v72-publish
```

4. Test administracyjny:

```text
?admin=1&v=20260710-v72-publish
```

5. Test plików danych:

```text
healthcheck.html
```

## Odświeżanie PDF-ów po konwersji

W Apps Script wklej lub zaktualizuj plik:

```text
scripts/pgw-refresh-pdf-manifest.gs
```

Po konwersji rysunków do PDF uruchom:

```javascript
pgwRefreshPdfManifestAfterConversion()
```

Opcjonalny dzienny automat:

```javascript
pgwInstallDailyPdfManifestRefresh()
```

Skrypt aktualizuje między innymi:

```text
data/drive-drawings-map.converted.json
data/pdf-orphans.json
data/pdf-quality-report.json
data/pdf-override-candidates.json
data/deployment-state.json
data/release-info.json
```

## Panel admina

Panel jest niewidoczny dla zwykłego klienta. Otwiera się dopiero po dodaniu parametru:

```text
?admin=1
```

W panelu można pobrać release health, source health, diagnostykę PDF i kandydatów do override’ów.

## Zasady formularza

- Strona nie pokazuje cen.
- Strona nie pokazuje stanów magazynowych.
- Jeśli część nie jest podpięta do listy, klient może opisać pozycję z rysunku PDF.
- Rysunki złożeniowe PDF są traktowane jako kluczowe źródło pomocnicze dla zapytania.

## Status release

Release: `20260710-v72-publish`  
Status: gotowe do publikacji po standardowym teście `healthcheck.html` i `?admin=1`.

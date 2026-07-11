# PGW Service Hub - formularz zapytania o części

Wersja: **20260710-v74-toya24-coverage-parts**

Najważniejsza zasada tej wersji: **każde urządzenie, które ma rysunek PDF na Drive, ma być dostępne w formularzu**. Formularz nie powinien ukrywać urządzenia tylko dlatego, że lista części nie została jeszcze w pełni przetworzona.

## Priorytet danych

1. Urządzenie + scalony PDF z rysunkiem i listą części.
2. Urządzenie + PDF z rysunkiem oraz lista części z osobnego źródła.
3. Urządzenie + sam rysunek PDF - klient wybiera/opisuje pozycję z rysunku.
4. Tryb ręczny - tylko dla nowych/brakujących urządzeń bez rysunku i bez listy części.

## Test po publikacji

```text
?v=20260710-v74-toya24-coverage-parts
?admin=1&v=20260710-v74-toya24-coverage-parts
healthcheck.html?v=20260710-v74-toya24-coverage-parts
smoke-test.html?v=20260710-v74-toya24-coverage-parts
```

## Raporty

- `data/catalog-coverage-v74.json` - kontrola pokrycia urządzeń/rysunków/części.
- `data/parts-generated-report.json` - części wygenerowane z PDF-ów frytkownic.
- `data/drive-drawings-map.converted.json` - aktualny manifest dopiętych/scalonych PDF-ów.

---

# PGW Service Hub — Formularz zapytania o części

Publikacyjna paczka statycznej aplikacji dla serwisu pogwarancyjnego TOYA. Klient wyszukuje urządzenie, widzi rysunek złożeniowy PDF, wybiera część albo opisuje ją ręcznie i otrzymuje gotową treść maila do `service@yato.pl`.

## Status

Release: `20260710-v73-stable-control`  
Typ: pełne repo do publikacji, nie patch  
Platforma: GitHub Pages / statyczny hosting  
Ceny i stany magazynowe: niewidoczne dla klienta

## Co zawiera

- wyszukiwarkę urządzeń i rysunków złożeniowych PDF,
- obsługę pełnego manifestu PDF oraz manifestu po konwersji,
- koszyk części z grupowaniem per urządzenie,
- tryb ręcznego opisu części, gdy lista pozycji nie jest jeszcze podpięta,
- generowanie maila bez cen i bez stanów magazynowych,
- panel admina pod `?admin=1`,
- samodzielny panel `admin.html`,
- szybki `healthcheck.html`,
- szybki `smoke-test.html`,
- lokalny self-check: `npm run check`,
- workflow GitHub Actions do kontroli statycznej,
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
admin.html                         standalone panel publikacyjny
healthcheck.html                   test obecności plików
smoke-test.html                    test danych i przykładowych wyszukiwań
scripts/pgw-repo-selfcheck.mjs      lokalny test repo
```

## Publikacja na GitHub Pages

1. Rozpakuj paczkę.
2. Wgraj zawartość folderu `pgw-service-hub-publish-20260710-v73` do głównego katalogu repo.
3. Commit: `Release 20260710-v73-stable-control`.
4. Po publikacji otwórz:

```text
?v=20260710-v73-stable-control
```

5. Panel admina:

```text
?admin=1&v=20260710-v73-stable-control
```

6. Testy:

```text
healthcheck.html?v=20260710-v73-stable-control
smoke-test.html?v=20260710-v73-stable-control
admin.html?v=20260710-v73-stable-control
```

## Odświeżanie PDF po konwersji

W Apps Script używaj jednego publikacyjnego pliku:

```text
scripts/pgw-refresh-pdf-manifest.gs
```

Po konwersji PDF uruchom:

```javascript
pgwRefreshPdfManifestAfterConversion()
```

Opcjonalny dzienny automat:

```javascript
pgwInstallDailyPdfManifestRefresh()
```

## Lokalna kontrola repo

```bash
npm run check
```

Nie trzeba instalować zależności — skrypt używa tylko Node.js.

## Zasady

- Strona nie pokazuje cen.
- Strona nie pokazuje stanów magazynowych.
- PDF jest traktowany jako główne źródło pomocnicze, gdy lista części nie jest jeszcze podpięta.
- Panel admina i pliki testowe są pomocnicze; zwykły klient korzysta tylko z formularza.

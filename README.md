# PGW Service Hub — v83 repo sync

Wersja: `20260714-v83-repo-sync-ui-i18n-pdf-fixes`

Ta aktualizacja łączy ostatnie poprawki PDF oraz tłumaczenie samego interfejsu strony.

## Zakres
- UI formularza: PL/EN.
- PDF-y: oryginały, bez masowego tłumaczenia.
- Nazwy części i urządzeń: oryginał, bez Google-Translate-prowizorki.
- Przygotowana baza pod późniejszy słownik techniczny części.

## Zasada językowa
Interfejs można tłumaczyć od razu. Części tłumaczymy dopiero kontrolowanym słownikiem serwisowym, żeby nie pomylić technicznych nazw.

---


## v82 — UI i18n foundation
- Dodano przełącznik języka strony PL/EN.
- Przetłumaczono interfejs formularza bez ruszania nazw części, urządzeń i PDF-ów.
- Dodano słownik `data/i18n-ui-v82.json` i dokumentację `docs/UI_TRANSLATION_V82.md`.
- Wygenerowany mail do serwisu pozostaje po polsku.

# PGW Service Hub - 20260714-v80-official-pdf-repair-batch

V80: kolejny batch napraw PDF. Trzy pliki nazwane wcześniej `__SCALONE` okazały się tabelami bez normalnego rysunku; zostały zastąpione lokalnymi publikacyjnymi PDF-ami z oficjalnych źródeł.

# PGW Service Hub - formularz zapytania o części

Wersja: **v76 / 20260711-v75-uniform-pdf-viewer**

Najważniejsza zasada tej wersji: **każde urządzenie, które ma rysunek PDF na Drive, ma być dostępne w formularzu**. Formularz nie powinien ukrywać urządzenia tylko dlatego, że lista części nie została jeszcze w pełni przetworzona.

## Priorytet danych

1. Urządzenie + scalony PDF z rysunkiem i listą części.
2. Urządzenie + PDF z rysunkiem oraz lista części z osobnego źródła.
3. Urządzenie + sam rysunek PDF - klient wybiera/opisuje pozycję z rysunku.
4. Tryb ręczny - tylko dla nowych/brakujących urządzeń bez rysunku i bez listy części.

## Test po publikacji

```text
?v=v75 / 20260711-v75-uniform-pdf-viewer
?admin=1&v=v75 / 20260711-v75-uniform-pdf-viewer
healthcheck.html?v=v75 / 20260711-v75-uniform-pdf-viewer
smoke-test.html?v=v75 / 20260711-v75-uniform-pdf-viewer
```

## Raporty

- `data/catalog-coverage-v75 / 20260711-v75-uniform-pdf-viewer.json` - kontrola pokrycia urządzeń/rysunków/części.
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


## v75 - jednolity podgląd rysunków PDF

Priorytetem formularza jest teraz kompletna karta urządzenia, a nie przypadkowy plik PDF. Klient ma widzieć urządzenie, jednolity podgląd rysunku i listę części, jeśli lista została rozpoznana.

Zasady wyboru PDF:

1. Najpierw plik `__SCALONE`, czyli rysunek + lista części w jednym PDF.
2. Potem standardowy `Czesci_zamienne_<indeks>.pdf` z listą części.
3. Dopiero na końcu rysunek techniczny lub roboczy wariant.
4. `Opisz część ręcznie` jest tylko fallbackiem dla nowych urządzeń bez rysunku/spisu.

Każdy link PDF w manifeście jest normalizowany do adresu `/preview`, żeby działał w iframe na GitHub Pages. Przycisk `Otwórz PDF` zostaje jako zapas, gdy przeglądarka zablokuje osadzony podgląd.


## v76 — PDF repair & blocked preview hardening

Ta wersja wzmacnia obsługę plików PDF, które są robocze, nietypowo nazwane albo potrafią blokować podgląd w iframe. Formularz preferuje wersje `__SCALONE.pdf`, pokazuje awaryjne linki `Podgląd` / `Otwórz PDF` i ma aliasy wyszukiwania modeli.


## v77 — kwarantanna publikacyjna PDF

Ta wersja dodaje automatyczny przesiew plików, które **nie powinny być pokazywane klientowi jako główny rysunek** w aktualnej formie. Nie usuwa ich z Drive; oznacza je jako źródło, zapas, duplikat albo materiał do naprawy.

Nowe pliki danych:

- `data/pdf-publication-quarantine.json`
- `data/pdf-publication-repair-plan.json`
- `data/pdf-publication-readiness.json`
- `docs/PDF_PUBLICATION_QUARANTINE.md`

Frontend uwzględnia te dane przy wyborze najlepszego PDF-a.


## v81 - False SCALONE repair
Naprawia kolejną serię plików, które wyglądały na gotowe po nazwie albo istnieniu PDF-a, ale render pokazywał pustą kartę / samą tabelę.

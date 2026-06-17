# PGW Service Hub — V54 heavy PDF header

Wersja V54 łączy pełny manifest Drive, kontrolowane zgadywanie marek oraz nowy tor odczytu nagłówków PDF. To jest paczka sensowna do wrzucenia jako większy krok, nie kosmetyka.

# PGW Service Hub v51 — pełny eksporter Drive

Wersja v51 przygotowuje stronę pod realną bazę rysunków z Google Drive.

## Najważniejsze zmiany

- strona próbuje wczytać `data/drive-drawings-map.full.json`, a potem fallback `data/drive-drawings-map.json`,
- pełny manifest może zawierać urządzenia, których nie ma jeszcze w `devices.json`,
- aplikacja tworzy lekkie rekordy urządzeń z samego manifestu Drive,
- PDF bez listy części działa w trybie opisowym,
- dodano paginowany Apps Script do skanowania folderu `Rysunki wybuchowe`,
- dodano audyt manifestu i eksport JSON.

## Wdrożenie

1. Wgraj paczkę do czystego repo.
2. Na razie strona działa na seedzie `data/drive-drawings-map.json`.
3. Uruchom eksporter z `scripts/google-drive-export-full-manifest.gs` w Google Sheets.
4. Pobierz wygenerowany JSON i zapisz jako `data/drive-drawings-map.full.json`.
5. Commit + push.

PDF-y nie trafiają do repo. Repo trzyma tylko JSON.


## Aktualizacja v52 — pełny manifest Drive

Paczka zawiera `data/drive-drawings-map.full.json` z **1405 PDF-ami** wygenerowanymi z Google Drive. Strona ładuje pełny manifest jako pierwsze źródło rysunków, a seed `drive-drawings-map.json` zostaje jako fallback.

## v53 — rozpoznawanie marek

Ta paczka zawiera pełny manifest Drive oraz ekran pomocniczy do rozpoznawania modeli, które nie mają pewnej marki.

- `data/drive-drawings-map.full.json` — pełny manifest PDF z Drive.
- `data/brand-review-unknown.json` — lista modeli do ręcznego rozpoznania.
- `data/brand-review-unknown.csv` — ta sama lista w CSV.
- `data/brand-resolution-overrides.json` — plik do wpisywania potwierdzonych marek.
- `brand-review.html` — wewnętrzny ekran do pracy nad markami.
- `scripts/apply-brand-overrides.py` — narzędzie do trwałego nałożenia potwierdzonych marek na manifest.

Niepewne modele nie blokują strony klienta. Są widoczne jako `DO ROZPOZNANIA`, mają PDF i mogą przejść trybem opisowym.


## v54 — zgadywanie marek

Wersja v54 przypisała zgadywane marki do 479 rekordów wcześniej oznaczonych jako `DO ROZPOZNANIA`. W manifestach zachowano pola jakości: `brandConfidence`, `brandReason`, `reviewStatus`. Najpierw weryfikować plik `data/brand-low-confidence-review.v54.csv`.


## V54 — większa zawartość paczki

V54 dokłada cały tor rozpoznawania nazw urządzeń z nagłówków PDF:

- `scripts/google-drive-extract-pdf-headers.gs`,
- `data/pdf-header-extraction-queue.json/.csv`,
- `data/pdf-header-overrides.json`,
- `header-review.html`,
- `scripts/apply-pdf-header-overrides.py`,
- `PDF_HEADER_EXTRACTOR_V54.md`.

Celem jest przejście od samego numeru pliku, np. `53575`, do nazwy widocznej dla klienta, np. `53575 — GRZECHOTKA POWLEKANA WYGIĘTA 1/4"`.

## v55 — ZUN jako części uniwersalne

Dodano obsługę części uniwersalnych ZUN z pliku `stan na 2026.05.29.xlsm`.

ZUN nie jest numerem sprawy — to wspólna część/zamiennik powiązana z wieloma indeksami części oraz wieloma urządzeniami. Szczegóły: `ZUN_UNIVERSAL_PARTS_V55.md`.


## V56 — automatyczne ZUN-y w mailu

Formularz sam sprawdza, czy wybrana część z rysunku ma powiązanie ZUN w `stan na 2026.05.29.xlsm`. Jeśli tak, dopisuje do gotowego maila sekcję „Informacja dla serwisu — ZUN-y dopasowane automatycznie”. Klient nie musi wiedzieć, czym jest ZUN; obsługa dostaje gotową podpowiedź do SAP/stanów.

Szczegóły: `ZUN_AUTO_MAIL_V56.md`.

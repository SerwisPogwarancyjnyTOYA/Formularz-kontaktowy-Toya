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

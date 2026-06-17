# PGW Service Hub v51 — pełny manifest rysunków Drive

Wersja v51 rozdziela ciężkie pliki PDF od lekkiej strony internetowej.

- PDF-y zostają w Google Drive.
- GitHub Pages trzyma tylko kod i JSON.
- Pełny manifest Drive może objąć tysiące rysunków bez zwiększania repo o gigabajty.
- Klient może znaleźć urządzenie również wtedy, gdy mamy tylko PDF, ale lista części nie jest jeszcze spięta.

To jest fundament do realnego uruchomienia bazy rysunków w wielu markach: YATO, YATO GASTRO, STHOR, VOREL, FLO, LUND, FALA i inne.


## Aktualizacja v52 — pełny manifest Drive

Paczka zawiera `data/drive-drawings-map.full.json` z **1405 PDF-ami** wygenerowanymi z Google Drive. Strona ładuje pełny manifest jako pierwsze źródło rysunków, a seed `drive-drawings-map.json` zostaje jako fallback.


## v54 — zgadywanie marek

Wersja v54 przypisała zgadywane marki do 479 rekordów wcześniej oznaczonych jako `DO ROZPOZNANIA`. W manifestach zachowano pola jakości: `brandConfidence`, `brandReason`, `reviewStatus`. Najpierw weryfikować plik `data/brand-low-confidence-review.v54.csv`.

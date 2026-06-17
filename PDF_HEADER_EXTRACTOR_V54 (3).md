# V54 — większa paczka: odczyt nazw urządzeń z nagłówków PDF

Wniosek z testu `Czesci_zamienne_53575.pdf` jest prosty: sama nazwa pliku nie wystarcza. W środku PDF-a jest nagłówek typu:

```text
53575 - GRZECHOTKA POWLEKANA
WYGIĘTA 1/4"
CZĘŚCI ZAMIENNE
TOYA S.A.
```

Dlatego v54 nie jest tylko kolejną kosmetyczną paczką. Zawiera pełny zestaw do wzbogacania bazy:

## Co jest nowe

- `scripts/google-drive-extract-pdf-headers.gs` — Apps Script do odczytu nagłówków PDF przez tymczasową konwersję PDF → Google Docs.
- `data/pdf-header-extraction-queue.json` — kolejka PDF-ów do odczytu nagłówka.
- `data/pdf-header-extraction-queue.csv` — ta sama kolejka w CSV.
- `data/pdf-header-overrides.json` — plik pod wynik nagłówków; startowo zawiera przykład 53575.
- `header-review.html` — lokalny ekran do ręcznego wklepywania nazwy z nagłówka i eksportu JSON.
- `scripts/apply-pdf-header-overrides.py` — nakłada rozpoznane nazwy na pełny manifest.
- `scripts/build-pdf-header-review-queue.py` — odbudowuje kolejkę z manifestu.
- `data/drive-drawings-map.full.json` — pełny manifest 1405/1418 wpisów, nadal bez PDF-ów fizycznie w repo.

## Jak używać

1. W Apps Script dopisz `google-drive-extract-pdf-headers.gs` do projektu.
2. Włącz usługę **Drive API** w Apps Script.
3. Uruchom:
   - `pgwHeaderReset()`
   - `pgwHeaderContinue()` partiami
   - `pgwHeaderBuildJsonFile()`
4. Pobierz wygenerowany JSON i zapisz jako:

```text
data/pdf-header-overrides.json
```

5. Opcjonalnie uruchom lokalnie:

```bash
python3 scripts/apply-pdf-header-overrides.py
```

## Dlaczego nie wrzucamy PDF-ów do repo

Repo ma zostać lekkie. PDF-y zostają w Google Drive. Strona trzyma tylko JSON:

```text
model → fileId Drive → nazwa urządzenia → marka/status → previewUrl
```

To daje pełną bazę bez robienia z GitHuba wysypiska 12 GB.

# PGW Service Hub v40 — clean deduped

Publiczna strona do wyszukiwania części i rysunków technicznych dla serwisu pogwarancyjnego.

## Zasady publicznej wersji

- Google Drive jest źródłem podglądu dla klienta.
- Pokazujemy tylko pliki PDF.
- Nie pokazujemy cen, stanów ani dostępności.
- Nie pokazujemy DOCX/JPG/PNG ani plików roboczych.
- Dane publiczne są odfiltrowane i odduplikowane.

## Pliki do publikacji

- `index.html`
- `app.js`
- `app.css`
- `config.js`
- `data/*.json`
- `assets/logos/*`
- `.github/workflows/deploy.yml`

## Czyszczenie danych

Skrypt:

```bash
python3 scripts/clean-public-data.py
```

usuwa duplikaty rysunków po `driveFileId`, scala części do zostawionego rysunku, usuwa nagłówki udające części oraz pilnuje trybu Drive + PDF-only.

# PDF repair / blocked preview policy — v76

Cel: klient ma widzieć jeden czytelny rysunek serwisowy, nawet jeśli źródłowy plik PDF jest roboczy, ma nietypową nazwę albo Google Drive nie chce go wygodnie osadzić w `iframe`.

## Priorytet wyboru PDF

1. `__SCALONE.pdf` — rysunek + lista części, gotowe do publikacji.
2. `Czesci_zamienne_<MODEL>.pdf` — standardowy PDF części.
3. zwykły rysunek PDF z Drive.
4. plik techniczny / roboczy / wariant — tylko awaryjnie.

## Co dodaje v76

- `data/pdf-repair-candidates.json` — lista plików podejrzanych, roboczych, nietypowych albo mających lepszy zamiennik.
- `data/pdf-viewer-fallbacks.json` — preferowany PDF dla danego modelu.
- `data/model-aliases.json` — wyszukiwanie po indeksach bez myślnika i po wariantach typu `YT-828113` → baza `YT-82811`.
- Viewer PDF ma zawsze widoczne przyciski `Podgląd` i `Otwórz PDF`.
- `driveByKey` wybiera najlepszy PDF po punktacji, a nie pierwszy znaleziony w manifeście.

## Wniosek praktyczny

Jeżeli PDF wygląda jak źródłowy/roboczy, ale istnieje scalona wersja, formularz powinien pokazać scaloną. Jeżeli podgląd iframe się blokuje, klient ma od razu link do otwarcia PDF w nowej karcie.

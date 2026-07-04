# PGW — analiza rysunków i list części

## Szybki stan
- Urządzenia w katalogu: 1410
- Rysunki w `drawings.json`: 1421
- Pozycje części w `parts.json`: 2179
- Urządzenia z PDF: 1410
- Urządzenia z podpiętą listą części: 34
- Urządzenia z PDF, ale bez listy części: 1376
- Rysunki bez listy części: 1387
- Rysunki bez tekstu i bez listy części: 1371
- Rysunki z tekstem, ale bez listy części: 16
- Rekordy w manifeście Google Drive: 1418
- Rekordy Drive z marką do potwierdzenia: 479

## Wniosek
Aktualnie problem nie leży w samej aplikacji, tylko w jakości i kompletności danych. PDF-y są w większości podpięte jako pliki, ale listy części istnieją tylko dla małego fragmentu katalogu. Największa robota to OCR/konwersja rysunków roboczych oraz wyciągnięcie tabel pozycji do struktury `parts.json`.

## Kolejność prac
1. Zamrozić format docelowy PDF dla rysunków roboczych.
2. Zrobić manifest roboczych folderów z Drive: folder modelu, źródła DOCX/JPG/PDF, status `do publikacji`.
3. Dla każdego modelu wygenerować jeden spójny PDF serwisowy.
4. Wyciągnąć listy części do CSV/JSON.
5. Oznaczyć rekordy OCR jako `do weryfikacji`, zanim trafią do publicznego formularza.
6. Po weryfikacji scalać partiami z `drawings.json` i `parts.json`.

## Pliki audytu
- `01_urzadzenia_pokrycie.csv`
- `02_rysunki_audit.csv`
- `03_manifest_drive_audit.csv`
- `04_porownanie_json_vs_drive.csv`
- `00_podsumowanie.json`

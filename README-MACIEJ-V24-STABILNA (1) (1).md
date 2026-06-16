# PGW Service Hub — v24 stabilna

Ta wersja jest zrobiona tak, żeby po wrzuceniu całej paczki strona faktycznie ruszyła, a nie wisiała na „Ładowanie danych…”.

## Naprawione

- `app.js` w root repozytorium jest prawdziwym JavaScriptem, nie workflow YAML.
- `assets/app.js` jest tą samą, poprawną aplikacją.
- Naprawiony błąd składni w generatorze treści maila (`lines.join('\n')`).
- Jeżeli użytkownik wpisze frazę zanim baza się załaduje, wyszukiwanie ruszy automatycznie po zakończeniu ładowania.
- Przywrócony prosty formularz klienta: firma / e-mail / telefon / NIP / dane do faktury / adres wysyłki / uwagi.
- Treść jest zapytaniem od klienta do serwisu, tylko do skopiowania.
- Pełna baza jest dostępna w kilku ścieżkach naraz:
  - `data/parts.generated.json`
  - `data/parts.json`
  - `parts.json`
  - analogicznie dla `drawings` i `devices`

## Ważne o rysunkach

Ta paczka zawiera pełny indeks części i rysunków, ale nie zawiera wszystkich fizycznych PDF/JPG/DOCX z rysunkami, bo źródłowe archiwum ma kilka GB. Strona pokaże rysunek inline wtedy, gdy plik istnieje w repo pod ścieżką z manifestu, np.:

`drawings/YATO/YT/YT-827795/Czesci_zamienne_YT-827795.pdf`

Do wrzucenia rysunków służy skrypt:

```bash
python3 scripts/przygotuj-i-importuj-rysunki.py "/ścieżka/do/folderu/z/ezyZip"
```

Po imporcie commit + push.

## Najważniejsze przy wdrożeniu

1. Nadpisz pliki z repo całą zawartością tej paczki.
2. Usuń śmieciowy plik `Icon` z repo, jeżeli GitHub Desktop go pokazuje.
3. Upewnij się, że `.github/workflows/deploy.yml` jest w folderze workflow, a nie w `app.js`.
4. Po pushu otwórz stronę z parametrem:

`?v=20260611-v24-stabilna`

# PGW Service Hub v2.1 — formularz klienta + podgląd rysunków

## Co poprawiono

- Treść maila jest zapytaniem **od klienta do serwisu**, nie odpowiedzią serwisu do klienta.
- Formularz klienta wrócił do pełnego układu: urządzenie, dane do faktury, dane do wysyłki, kontakt, uwagi.
- Usunięto sformułowania typu „Odpowiedź dla klienta” oraz „Do treści maila”.
- Dodano oryginalne pliki logo marek znalezione w źródłowym archiwum: YATO, VOREL, STHOR, LUND, FLO, FALA.
- Podgląd rysunku nie pokazuje już brzydkiej strony 404 GitHuba w ramce. Jeżeli plik PDF/JPG/DOCX nie został jeszcze wrzucony do repozytorium, strona pokazuje czytelny komunikat z brakującą ścieżką.

## Bardzo ważne o rysunkach

Wyszukiwarka zna części i ścieżki rysunków z plików JSON, ale podgląd działa tylko wtedy, gdy fizyczne pliki rysunków są obecne w repozytorium pod katalogiem `drawings/...`.

Jeżeli widzisz komunikat „Rysunek nie jest jeszcze opublikowany w repozytorium”, trzeba uruchomić import rysunków z paczek źródłowych.

Z katalogu repozytorium:

```bash
python3 scripts/przygotuj-i-importuj-rysunki.py "/ścieżka/do/folderu/z/archiwami"
```

Skrypt obsłuży folder z gotowymi ZIP-ami albo folder z częściami `ezyZip.z01 ... ezyZip.zip`. Jeżeli masz gotowe ZIP-y, folder powinien zawierać m.in.:

- `PGW - Rysunki-20260604T095309Z-3-001.zip`
- `PGW - Rysunki-20260604T095309Z-3-002.zip`
- `Rysunki wybuchowe-Robocze-20260604T094743Z-3-001.zip`

Po imporcie trzeba zrobić commit i push do GitHuba.

## Cache

Po wrzuceniu tej wersji najlepiej otworzyć stronę z parametrem:

```text
?v=20260610-v21-formularz
```


# PGW v81 - False SCALONE / empty auto-PDF fixes

Wersja: `20260714-v81-false-scalone-repair`  
Data: `2026-07-14T13:35:00+02:00`

## Cel

Nie ufamy nazwie pliku. Jeżeli `__SCALONE` albo automatycznie wygenerowany PDF jest pustą kartą, samą tabelą albo półproduktem, to nie idzie jako główny PDF dla klienta.

## Naprawione w v81

| Model | Decyzja | Części |
|---|---:|---:|
| `YT-85004` | oficjalny PDF promowany jako lokalny `__SCALONE` | 121 |
| `YT-82200` | oficjalny PDF promowany jako lokalny `__SCALONE` | 68 |
| `YG-09230` | oficjalny PDF promowany jako lokalny `__SCALONE` | 0 |


## Wynik

- Naprawione PDF-y: **3**
- Dodane / przepięte części: **189**
- Łącznie części w bazie: **3887**
- Łącznie rysunków w bazie: **1450**

## Uwagi

`YG-09230` ma dobry wizualnie PDF oficjalny, ale lista części jest graficzna / bardzo uboga tekstowo, więc nie dodaję sztucznie pozycji części bez ręcznej kontroli.

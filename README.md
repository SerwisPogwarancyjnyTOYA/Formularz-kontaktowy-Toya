# PGW Service Hub v49 — visual monitor + multi-brand Drive manifest

Wersja v49 przygotowuje formularz pod wiele marek oraz pełny manifest Google Drive.

## Najważniejsze zmiany

- monitor bazy w prawym panelu,
- filtr marek przy wyszukiwarce urządzeń,
- automatyczne grupowanie urządzeń według marki,
- obsługa marek: YATO, YATO GASTRO, STHOR, VOREL, FLO, LUND, FALA oraz INNE,
- repo nadal nie przechowuje PDF-ów, tylko lekkie JSON-y,
- generator manifestu Drive eksportuje tylko PDF-y.

## Wdrożenie

Wrzuć zawartość paczki do czystego repo i opublikuj przez GitHub Pages.

Test po publikacji:

```
https://serwispogwarancyjnytoya.github.io/Formularz-kontaktowy-Toya/?v=20260617-v49-brands-manifest
```


## v50 — Drive seed + marki nie-YATO

- dodano seed PDF-only dla LUND/STHOR/FLO oraz lokalne podpowiedzi VOREL,
- strona potrafi pokazać PDF nawet bez spiętej listy części,
- klient przechodzi wtedy trybem opisowym,
- pełny manifest 1400+ PDF generuje `scripts/google-drive-export-full-manifest.gs`.

Szczegóły: `PEŁNY_MANIFEST_DRIVE_V50.md`.

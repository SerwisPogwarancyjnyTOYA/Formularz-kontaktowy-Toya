# PDF Publication Quarantine — v77

Cel: wyłapać pliki, które **nie powinny być głównym rysunkiem klienta w obecnej formie**, ale nie usuwać ich z archiwum.

## Zasada publikacji

Formularz wybiera w kolejności:

1. `__SCALONE.pdf` — scalony komplet: karta / rysunek / lista części.
2. standardowy `Czesci_zamienne_<MODEL>.pdf` z czytelnym podglądem.
3. plik techniczny/roboczy tylko jako fallback, gdy nie ma nic lepszego.

## Dane v77

- `data/pdf-publication-quarantine.json` — czarna lista publikacyjna / nie używaj jako primary.
- `data/pdf-publication-repair-plan.json` — kolejka napraw: scalić, porównać, przekonwertować, podmienić.
- `data/pdf-publication-readiness.json` — jeden preferowany PDF na model.

## Podsumowanie

- Przeskanowane rekordy PDF: 1445
- Modele z PDF: 1422
- Pliki nie do publikacji jako główny PDF teraz: 79
- Z gotowym zamiennikiem/scalonym plikiem: 23
- Wymaga naprawy/oceny bez bezpiecznego zamiennika: 1

## Co dalej

Najpierw poprawiać pozycje z `pdf-publication-repair-plan.json`, a dopiero po przejściu wzrokowym przesuwać je do statusu publikacyjnego.

# PGW v82 — Real Drawing Quality Gate

Ta wersja blokuje publikację PDF-ów roboczych jako rysunków dla klienta.

## Problem

Plik `yt-828113-yt-828114.pdf` wyglądał jak karta/tabela części, a nie rysunek złożeniowy. Taki plik nie może być widoczny na stronie jako rysunek PDF.

## Reguła produkcyjna

Klient może zobaczyć tylko:

1. realny rysunek serwisowy / wybuchowy,
2. zweryfikowany scalony komplet `__SCALONE.pdf`,
3. kanoniczny plik `Czesci_zamienne_<MODEL>.pdf`, jeśli faktycznie zawiera rysunek.

Nie pokazujemy klientowi:

- PDF-ów roboczych wygenerowanych automatycznie,
- samej tabeli części bez rysunku,
- plików z folderu `robocze`, jeśli nie są zweryfikowane/scalone,
- zastępczych kart „PDF roboczy wygenerowany automatycznie”.

## Pliki v82

- `data/drive-drawings-map.generated-v82.json` — manifest po filtracji,
- `data/pdf-customer-visible-blocklist-v82.json` — twarda blokada plików niedopuszczalnych,
- `data/pdf-quarantine-v82.json` — pliki usunięte z katalogu klienta,
- `data/real-drawing-quality-audit-v82.json` — raport jakości.

## Test

```bash
npm run drive-quality-gate
```

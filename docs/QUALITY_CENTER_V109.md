# PGW v109 - Quality Operations Center

Kandydat `0.5.0-rc1` dodaje niezależne centrum operacyjne do kontroli jakości rysunków.

## Funkcje
- jeden widok TOYA24 vs Drive vs repo,
- kolejka 27 modeli z priorytetami,
- filtry READY / REBUILD / MANUAL_REQUIRED / ARCHIVE_ONLY,
- szybkie wygrane,
- generator drukowalnej karty roboczej,
- eksport JSON i CSV,
- twardy release gate bez zgadywania danych.

## Test
```bash
npm run quality-center-check
npm run release-v109-check
```

Aktualizacja nie zmienia publicznej mapy PDF. Publiczne mogą być tylko rekordy `READY`.

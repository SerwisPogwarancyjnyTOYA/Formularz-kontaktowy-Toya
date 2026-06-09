# YATO Service Hub — repair1

Naprawiona wersja po regresji wyszukiwarki.

## Testy po wdrożeniu
- YT-82830 → powinien znaleźć urządzenie i części.
- ZY8283001A → powinien znaleźć część i urządzenie YT-82830.
- YT-85010 → powinien znaleźć urządzenie i części.
- ZY85010-34 → powinien znaleźć część.

## Uwaga
Rysunki globalnie są obsługiwane przez indeks `data/drawings.json`. W tej paczce aktywnie podpięte są testowe rysunki Drive dla YT-82830, YT-85010 i YT-82161; pozostałe będą dopinane globalnie po eksporcie pełnego indeksu rysunków z Drive/paczek.

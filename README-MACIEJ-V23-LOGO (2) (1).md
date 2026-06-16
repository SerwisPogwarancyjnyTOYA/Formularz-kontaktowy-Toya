# v23 — poprawka logo w nagłówku

Poprawka usuwa przypadkowe logo YATO Gastro z lewego górnego rogu.

Co zmieniono:
- nagłówek korzysta teraz z `assets/logos/yato-clean.png`, a nie z błędnego `yato-wordmark-clean.png`,
- plik `assets/logos/yato-wordmark-clean.png` został nadpisany poprawnym zwykłym logo YATO, żeby stare odwołania nie pokazywały już YG,
- usunięto z paczki pliki `yato-gastro.png` i `yato-gastro-clean.png`, żeby nie wracały przez przypadek,
- podbito wersje cache do `20260611-v23-logo`.

Po wdrożeniu sprawdź stronę z parametrem:
`?v=20260611-v23-logo`

Uwaga: to nadal nie jest oficjalny pakiet logotypów TOYA w jakości marketingowej. To poprawka błędnego assetu. Do wersji dyrektorskiej najlepiej podmienić logotypy na oficjalne pliki PNG/SVG od marketingu.

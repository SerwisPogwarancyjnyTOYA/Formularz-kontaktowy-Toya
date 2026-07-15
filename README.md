# TOYA Global Service Hub - 0.5.0.v1

To wydanie zmienia formularz w wielojęzyczne narzędzie klienta i serwisu.

## Najmocniejsze funkcje
- 6 języków: PL, EN, DE, CS, SK, UA,
- Paszport Serwisowy z kodem sprawy, drukiem/PDF i przyciskiem e-mail,
- bezpieczne linki udostępniania bez danych osobowych,
- deep link do modelu i odtworzenie wybranych części,
- PWA i tryb offline dla wcześniej pobranego katalogu,
- duży tekst, wysoki kontrast i redukcja animacji,
- skonsolidowany patch publiczny zawierający tylko cztery rekordy READY.

## Audyt bieżący
Sprawdzono YT-828254, YT-828255 i YT-828256. Dokumentacja techniczna jest kompletna (3 strony i 47/47 SAP/PL/EN na model), ale współdzielony JPG jest rysunkiem wybuchowym, nie zdjęciem produktu. Modele pozostają REBUILD.

## Test
```bash
npm run release-v050-v1-check
```

Commit i push nie są deklarowane bez potwierdzenia.

## Potwierdzone testy
- `npm run release-v110-check` → PASS (`models=33 ready=4 workOrders=29 gaps=33 fastWins=13`)
- `npm run release-v050-v1-check` → PASS (`languages=6 publicReady=4 audited=3 privacyShare=true offlineShell=true`)

Naprawiono wcześniejszy błędny łańcuch testów, który próbował wymuszać wersję v98 na wydaniu 0.5.0.v1.

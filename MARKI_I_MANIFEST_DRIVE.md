# Marki i manifest Drive — v51

## Obsługiwane marki

- YATO
- YATO GASTRO
- STHOR
- VOREL
- FLO
- LUND
- FALA
- INNE / do weryfikacji

## Reguły rozpoznawania

1. `YT-...` albo folder/nazwa YATO → YATO.
2. `YG-...`, `YATO GASTRO`, `GASTRO` → YATO GASTRO.
3. Folder lub nazwa zawiera STHOR/VOREL/FLO/LUND/FALA → dana marka.
4. Indeksy numeryczne dostają markę z seedowych wyjątków, jeśli jest znana.
5. Reszta trafia do `INNE` z niską pewnością.

## Dlaczego tak

W Drive część plików ma nazwy typu `Czesci_zamienne_79098.pdf`, bez marki w nazwie. Wtedy nie zgadujemy na siłę. Lepiej mieć `INNE` i raport do poprawy niż pokazać klientowi błędną markę.

## Co potem

Po pełnym eksporcie trzeba przejrzeć `manifest-audit`, szczególnie:

- `unknownBrand`,
- `missingModel`,
- duplikaty `fileId`,
- modele z wieloma PDF-ami.

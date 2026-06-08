# Pełny import - status v4

Data: 2026-06-07T02:28:57Z

## Zrobione w tej paczce

- Dodano realny import PDF z Drive dla `YT-85177` / `YT-85176`.
- PDF: `Czesci_zamienne_YT-85177.pdf`.
- Dodano lokalną kopię PDF do `drawings/YATO/YT/`, więc rysunek działa również offline z paczki.
- Dodano 66 rekordów części, czyli po 33 pozycje dla `YT-85177` i `YT-85176`.
- Testy: `YT-85177`, `ZY85176-31`, `YT-82200`, `ZY8220011`.

## Dalej

- Masowy crawler Drive: wyszukiwać modele po `Czesci_zamienne_<MODEL>.pdf`.
- Masowy parser PDF: wyciągać `NO / INDEKS / PART NAME / NAZWA`.
- Masowy crawler TOYA24: karta produktu -> załącznik Części zamienne.

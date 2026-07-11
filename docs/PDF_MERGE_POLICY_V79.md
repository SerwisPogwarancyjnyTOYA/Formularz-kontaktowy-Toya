# PGW v79 - polityka scalania PDF

## Priorytet pliku dla klienta

1. `Czesci_zamienne_<model>__SCALONE.pdf`
2. PDF zawierający rysunek i listę części.
3. `Czesci_zamienne_<model>.pdf`
4. Rysunek techniczny bez listy części.
5. Wariant roboczy tylko dla serwisu.

## Kiedy scalać

Scalamy, gdy dla jednego modelu są osobne pliki:

- rysunek techniczny / exploded view,
- lista części / spare parts list,
- plik z indeksami części z ToYa24.

Wynik powinien mieć nazwę:

```text
Czesci_zamienne_<MODEL>__SCALONE.pdf
```

## Wyszukiwarka

Klient widzi jedno urządzenie i jeden najlepszy PDF. Warianty/duplikaty nie powinny być pierwszym wyborem w formularzu.

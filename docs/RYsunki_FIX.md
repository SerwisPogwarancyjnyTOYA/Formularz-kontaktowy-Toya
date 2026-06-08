# Poprawka wyświetlania rysunków

Wersja `20260608-drawing-fix1` zmienia logikę podglądu rysunków:

- rysunek jest wyszukiwany po `drawingId`, `deviceIndex` oraz nazwie pliku po normalizacji,
- jeśli istnieje link Google Drive `preview`, formularz używa go przed lokalnym plikiem PDF,
- brak lokalnego PDF w repo nie blokuje podglądu z Drive,
- komunikaty techniczne typu import/backup są ukryte przed klientem,
- dla `YT-82161` dodano bezpośrednie mapowanie do `Czesci_zamienne_YT-82161.pdf` z Google Drive.

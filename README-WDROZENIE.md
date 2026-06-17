# Wdrożenie v49

1. Rozpakuj paczkę.
2. Wgraj zawartość do czystego repo GitHub Pages.
3. Nie wrzucaj PDF-ów do repo.
4. Pełny manifest z Drive generuj skryptem `scripts/google-drive-export-full-manifest.gs`.
5. Wynikowy `drive-drawings-map.json` wgraj do `data/drive-drawings-map.json`.

## Marki

Nie tworzymy osobnych stron dla marek. Jedna aplikacja obsługuje wszystkie marki przez pole `brand` w danych. Jeżeli marka nie jest podana, strona próbuje ją wywnioskować z folderu, indeksu lub nazwy pliku.

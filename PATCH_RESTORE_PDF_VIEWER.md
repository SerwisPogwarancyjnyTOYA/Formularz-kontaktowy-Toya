# PATCH — przywrócenie podglądu PDF

Cel: przywrócić działającą funkcjonalność podglądu rysunków PDF bez cofania całej aplikacji i bez kasowania nowych danych części.

## Co zmieniono

1. `app.js`
   - dodano `getPdfSource(drawing)` — jeden wspólny resolver źródła PDF,
   - dodano `makePdfPreviewUrl(url)` — zamienia linki Google Drive `/view` na `/preview`,
   - dodano `makePdfOpenUrl(url)` — generuje normalny link do otwarcia PDF w nowej karcie,
   - `renderViewer()` ponownie osadza PDF w `<iframe>` na podstawie:
     - `drive-drawings-map`,
     - `viewerUrl`,
     - `previewUrl`,
     - `path`,
     - `openUrl`,
     - `url` z rekordu rysunku,
   - mail używa tego samego resolvera linku do PDF.

2. `app.css`
   - sekcja `Rysunek PDF` została przesunięta wyżej w prawym panelu,
   - ustawiono stałą/minimalną wysokość podglądu, żeby nie ginął pod koszykiem.

## Testy po wdrożeniu

Sprawdzić minimum:

- `YT-85271` — powinien mieć PDF i listę części,
- `YT-828113` — powinien mieć PDF roboczy i części,
- `YT-852091` — roboczy PDF,
- `YT-85600` — roboczy PDF.

Po wrzuceniu na GitHub Pages zrobić twarde odświeżenie: `Cmd + Shift + R`.

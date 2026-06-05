# Interaktywny viewer rysunku technicznego

Wersja: `20260605-drawing-viewer2`

Dodano moduł pod wersję 2 katalogu części:

- zoom kółkiem myszy,
- przyciski `+`, `-`, `Reset`,
- przesuwanie rysunku myszą / palcem,
- przygotowanie pod hotspoty pozycji na rysunku,
- kliknięcie części z listy podświetla/fokusuje rysunek,
- w demo SVG kliknięcie numeru pozycji dodaje część do zapytania,
- przy PDF-ach z Google Drive działa warstwa zoom/pan oraz przycisk „Otwórz rysunek”.

Docelowo, po segregacji rysunków i mapowaniu pozycji, do `drawings.json` można dopisywać hotspoty:

```json
{
  "deviceIndex": "YT-84920",
  "hotspots": [
    {"position":"12", "x":710, "y":232, "partIndex":"..."}
  ]
}
```

Wtedy klik z listy części będzie mógł automatycznie zoomować do konkretnego miejsca na rysunku.

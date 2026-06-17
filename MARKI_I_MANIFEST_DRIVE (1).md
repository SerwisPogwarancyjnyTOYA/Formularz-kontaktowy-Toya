# Marki i pełny manifest Drive — v49

## Jak ma działać wiele marek

Strona nie powinna mieć osobnej wersji dla YATO, STHOR, VOREL, FLO, LUND itd. Jedna wyszukiwarka obsługuje wszystkie marki. Marka jest tylko filtrem i etykietą przy urządzeniu.

## Minimalny rekord w manifeście Drive

```json
{
  "brand": "YATO",
  "deviceIndex": "YT-82200",
  "fileName": "Czesci_zamienne_YT-82200.pdf",
  "fileId": "GOOGLE_DRIVE_FILE_ID",
  "mimeType": "application/pdf",
  "viewerUrl": "https://drive.google.com/file/d/GOOGLE_DRIVE_FILE_ID/preview",
  "openUrl": "https://drive.google.com/file/d/GOOGLE_DRIVE_FILE_ID/view",
  "keys": ["YT-82200", "YT82200", "Czesci_zamienne_YT-82200"]
}
```

## Inne marki niż YATO

Działają tak samo jak YATO, jeśli mają rekordy w `data/drive-drawings-map.json` oraz powiązane rekordy w `data/devices.json`, `data/drawings.json` i `data/parts.json`.

Jeżeli marka nie jest podana, strona próbuje ją wywnioskować z folderu, nazwy pliku albo indeksu. Gdy się nie da, urządzenie wpada do grupy `INNE`.

## Czego nie trzymamy w repo

Nie trzymamy w repo PDF-ów, JPG, PNG, miniatur ani wyciętych elementów. Repo ma trzymać kod i lekkie JSON-y. PDF-y zostają na Google Drive.

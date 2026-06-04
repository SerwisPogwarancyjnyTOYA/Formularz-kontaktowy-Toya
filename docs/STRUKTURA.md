# Struktura projektu

To jest fundament pod dalsze porządkowanie rysunków i większą bazę części.

## Logotypy

Logotypy marek są w folderze:

```text
assets/logos/
├── yato.jpg
├── vorel.png
├── sthor.jpg
├── lund.jpg
├── flo.jpg
└── fala.jpg
```

W paczce nie było osobnego oficjalnego logo TOYA, więc na stronie użyty jest tekstowy znak `TOYA S.A.`. Gdy będzie właściwy plik, wrzuć go jako `assets/logos/toya.svg` albo `assets/logos/toya.png` i zaktualizuj `data/logos.json`.

## Rysunki

Docelowa struktura lokalna pod GitHub Pages:

```text
drawings/
├── YATO/
│   ├── YT/
│   └── YG/
├── VOREL/
├── STHOR/
├── LUND/
├── FLO/
├── FALA/
├── unmapped/
└── _incoming/
```

`_incoming` — miejsce na nowe rysunki przed rozpoznaniem.

`unmapped` — pliki, których nie da się jednoznacznie przypisać po nazwie.

## Indeks rysunków

Aplikacja czyta plik:

```text
data/drawings.json
```

Przykładowy wpis:

```json
{
  "id": "yt-828390",
  "deviceIndex": "YT-828390",
  "brand": "YATO",
  "title": "Czesci_zamienne_YT-828390.pdf",
  "type": "drive-pdf",
  "status": "indexed_from_drive",
  "localPath": "drawings/YATO/YT/YT-828390.pdf",
  "driveViewUrl": "https://drive.google.com/file/d/.../view",
  "drivePreviewUrl": "https://drive.google.com/file/d/.../preview"
}
```

Aplikacja najpierw próbuje pokazać lokalny PDF/obraz z `localPath`. Link Drive zostaje jako awaryjne otwarcie.

# PGW Service Hub v26 — pilotaż z rysunkami na Google Drive

Ta wersja zostawia GitHub jako lekką aplikację, a rysunki traktuje jako zasób z Google Drive.

## Co zmieniono

- `config.js` ma ustawione `storageMode: 'drive'`.
- Strona próbuje czytać `data/drive-drawings-map.json`.
- Jeżeli rysunek ma `fileId`, podgląd otwiera się inline przez Google Drive `/preview`.
- Jeżeli `fileId` nie jest jeszcze uzupełniony, klient nie zobaczy brzydkiego 404 — zobaczy komunikat i przycisk do znalezienia pliku w Google Drive.
- Repo nie musi zawierać ciężkich PDF/JPG/DOCX.

## Co trzeba zrobić przed prezentacją

1. Wrzucić/podmienić całą paczkę w repo.
2. Upewnić się, że folder rysunków w Google Drive jest udostępniony przynajmniej jako „każdy z linkiem może wyświetlać”.
3. Stopniowo uzupełniać `data/drive-drawings-map.json` o `fileId` rysunków.
4. Zacząć od najczęściej szukanych modeli i przykładowych rekordów do prezentacji.

## Format manifestu Drive

```json
[
  {
    "deviceIndex": "YT-827795",
    "fileName": "Czesci_zamienne_YT-827795.pdf",
    "fileId": "18m1QdR5XyAirPAn10mRO3ok2pjA2wAxm"
  }
]
```

`fileId` to środkowa część linku Google Drive:
`https://drive.google.com/file/d/FILE_ID/view`

## Dlaczego tak

To jest najbezpieczniejszy etap pilotażu: GitHub Pages pozostaje lekki, a rysunki nie zapychają repozytorium. Jeżeli dyrektor zaakceptuje projekt, informatycy mogą później podmienić Google Drive na TOYA24/CDN bez przebudowywania logiki strony.

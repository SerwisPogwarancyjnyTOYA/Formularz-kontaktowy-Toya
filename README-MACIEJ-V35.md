# PGW Service Hub v35 — Google Drive jako źródło klienta

Decyzja: klient widzi podgląd rysunków z Google Drive, ponieważ to aktualnie działa stabilnie.

Zasady publiczne:
- pokazujemy wyłącznie rysunki PDF,
- ukrywamy DOC/DOCX/JPG/PNG i inne formaty,
- ukrywamy ceny i dostępność,
- ukrywamy rekordy bez podpiętego PDF w manifeście Google Drive,
- formularz generuje tylko treść zapytania do skopiowania.

Technicznie:
- `config.js` ma `storageMode: drive` i `publicDriveOnly: true`,
- aplikacja ładuje `data/drive-drawings-map.json`,
- rysunki bez Drive fileId nie są widoczne w trybie publicznym,
- pełna jakość zależy od uzupełnienia manifestu Drive dla wszystkich PDF.

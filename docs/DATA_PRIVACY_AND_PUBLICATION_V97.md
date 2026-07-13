# Data privacy and publication policy - v97

## Publiczne

Kod aplikacji, publiczne manifesty, linki do zweryfikowanych PDF-ów, zagregowane raporty jakości i dokumentacja techniczna bez danych operacyjnych.

## Prywatne / tylko Drive

- XLS/XLSX/XLSM z cenami, stanami magazynowymi, historią wydań lub klientami;
- DOC/DOCX i ZIP-y fabryczne oraz robocze;
- wiadomości MSG/EML, numery klientów, proformy i dane kontaktowe;
- tokeny, klucze, pliki `.env`, certyfikaty i logi lokalne;
- materiały oznaczone `Robocze`, `MANUAL_REQUIRED` lub `ARCHIVE_ONLY`, o ile nie są wyłącznie bezpiecznym raportem zagregowanym.

Folder `private-workbench/` jest synchronizowany przez Drive, ale ignorowany przez Git. `npm run release-v97-check` blokuje przypadkowe umieszczenie prywatnych formatów w śledzonym drzewie.

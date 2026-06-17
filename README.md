# PGW Service Hub v41

Lekka strona GitHub Pages dla klientów serwisu pogwarancyjnego TOYA.

## Założenia

- klient najpierw szuka urządzenia,
- po wyborze urządzenia pojawia się rysunek PDF z Google Drive,
- klient wybiera części,
- potem uzupełnia dane kontaktowe, fakturowe i wysyłkowe,
- na końcu dostaje gotowy mail do skopiowania i wysłania na `service@yato.pl`.

Strona nie pokazuje cen, stanów magazynowych ani dostępności.
PDF-y nie są trzymane w repozytorium. Repo zawiera tylko kod i lekkie pliki JSON.

## Pliki publiczne

- `index.html` — aplikacja
- `app.css` — wygląd
- `app.js` — logika krokowego formularza
- `config.js` — konfiguracja
- `data/*.json` — katalog urządzeń, rysunków, części i mapowanie Drive

## Uwaga o dużym repo

Jeżeli folder `.git` waży setki MB, to ciężkie pliki są w historii Gita. Najczystsze rozwiązanie to świeże repo / świeża historia i wklejenie tej paczki jako start.


## Zmiany v44

- Dane do faktury są opcjonalne i nie blokują przejścia do maila.
- Dane do wysyłki są opcjonalne i nie blokują przejścia do maila.
- Do przejścia do maila wystarczy wybrane urządzenie, minimum jedna część oraz kontakt: imię/nazwa + email albo telefon.
- Jeśli klient nie poda faktury lub wysyłki, mail zawiera informację „do ustalenia z serwisem”.

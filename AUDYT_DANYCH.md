# Audyt danych PGW Service Hub

- Rysunki / pliki graficzne / PDF/DOCX zaindeksowane: **4756**
- Części odczytane z PDF po odfiltrowaniu śmieci: **78306**
- Odrzucone fałszywe trafienia z tekstu PDF: **2866**
- Modele / indeksy urządzeń: **1550**
- Rekordy cenowe z Excela: **4**
- Rekordy stanów z pliku `stan na 2026.05.29.xlsm`: **36330**
- Części z rozpoznanym stanem większym/ustalonym w JSON: **15860**

## Ważne ograniczenia

- Same pliki PDF/JPG/PNG/DOCX nie są dołączone do lekkiej paczki wdrożeniowej — trzeba je mieć w repo w katalogu `drawings/...` albo uruchomić skrypt importujący.
- Części są odczytywane automatycznie z tekstu PDF; skany bez tekstu będą widoczne jako rysunek, ale tabela części może wymagać ręcznego dopisania.
- PDF-y bez rozpoznanej tabeli części: **570**.
- DOCX zaindeksowane jako pliki, ale bez podglądu inline: **1437**.

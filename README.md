# PGW Service Hub v42 — guided flow

Lekka strona GitHub Pages do obsługi zapytań o części serwisowe.

## Założenia

- klient idzie krokowo: urządzenie → rysunek PDF → części → dane → gotowy mail,
- rysunki PDF są podglądane z Google Drive,
- repo nie trzyma ciężkich PDF-ów,
- strona nie pokazuje cen ani stanów magazynowych,
- gotowy mail jest do skopiowania i wysłania na `service@yato.pl`.

## Co nowego w v42

- spokojniejszy, bardziej prowadzony flow klienta,
- kontekstowy panel „Aktualny krok”,
- pomoc przy szukaniu indeksu urządzenia,
- limitowane/dawkowane wyświetlanie dużych list części,
- lepsze przyciski przejścia: wróć / dalej / generuj mail,
- pole numeru seryjnego urządzenia,
- link do rysunku PDF dopisywany do generowanego maila, jeśli jest dostępny,
- odświeżona warstwa wizualna: badge, help boxy, lepsze stany puste i responsywność.

## Wdrożenie

Najlepiej wkleić zawartość paczki do świeżego repo z czystą historią. Aktualne stare repo ma bardzo ciężki folder `.git`, więc samo kasowanie plików nie odchudzi historii.


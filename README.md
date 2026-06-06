# YATO Service Hub

Statyczna aplikacja HTML/CSS/JS do obsługi zapytań o części pogwarancyjne.

Klient wyszukuje urządzenie lub część, sprawdza rysunek/załącznik, dodaje pozycje do zapytania i generuje gotową wiadomość do serwisu.

## Źródła danych

- **Baza części**: główny arkusz PGW na Google Drive.
- **TOYA24 integracja**: zakładka w tym samym arkuszu, mapująca model urządzenia do karty produktu TOYA24 i PDF-a części zamiennych.
- **TOYA24**: główne źródło PDF-ów / załączników.
- **Google Drive**: backup rysunków, gdy TOYA24 nie jest jeszcze zmapowane.

Repo nie przechowuje ciężkich PDF-ów. Zawiera aplikację, indeks części i lekką mapę linków.

## Aktualizacja mapy TOYA24

1. Uzupełnij zakładkę `TOYA24 integracja` w arkuszu Google.
2. Wyeksportuj ją do CSV jako `data/toya24-integracja.csv`.
3. Uruchom:

```bash
node scripts/sheet-to-toya24-index.mjs data/toya24-integracja.csv assets/toya24-index.js
```

4. Zrób commit i push do GitHub Pages.

## Dane klientów

Aplikacja nie zapisuje danych klientów na serwerze. Wiadomość jest generowana lokalnie w przeglądarce użytkownika.

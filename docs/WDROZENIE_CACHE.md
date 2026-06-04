# Wdrożenie i cache GitHub Pages

Ta paczka podbija wersję plików `style.css`, `app.js`, logo w nagłówku oraz service workera.

Po wrzuceniu zmian:

1. Zrób commit i `Push origin`.
2. Wejdź w GitHub → Actions i poczekaj na zielony status wdrożenia Pages.
3. Otwórz stronę z parametrem:
   `https://serwispogwarancyjnytoya.github.io/Formularz-kontaktowy-Toya/?v=20260604-logo2`
4. W Chrome można też użyć `Cmd + Shift + R`.

Jeśli wcześniej aplikacja została zainstalowana jako PWA, stary service worker mógł trzymać poprzedni wygląd. Ta wersja usuwa stare cache po aktywacji.

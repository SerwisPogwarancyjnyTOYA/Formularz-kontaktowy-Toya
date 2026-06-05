# AI-ready: dobór części po opisie

Ten etap nie podpina jeszcze prawdziwego modelu AI do publicznej strony. GitHub Pages jest statyczny, więc nie wolno umieszczać w nim kluczy API.

Obecnie działa lokalny matcher:

- klient wybiera urządzenie,
- opisuje część własnymi słowami,
- strona szuka kandydatów tylko w częściach przypisanych do wybranego urządzenia,
- wynik można dodać do zapytania.

Docelowo prawdziwe AI powinno działać przez bezpieczny backend, np. Cloudflare Worker albo Supabase Edge Function. Model AI może wybierać wyłącznie z listy części istniejącej w bazie. Nie powinien wymyślać indeksów.

## Zasada bezpieczeństwa

AI nie sprzedaje i nie potwierdza części. AI tylko podpowiada kandydatów z rysunku, a klient/serwis potwierdza wybór.

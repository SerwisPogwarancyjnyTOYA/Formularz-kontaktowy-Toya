# QA checklist — 20260710-v73-stable-control

- [ ] `healthcheck.html?v=20260710-v73-stable-control` pokazuje OK przy kluczowych plikach.
- [ ] `smoke-test.html?v=20260710-v73-stable-control` zwraca status `pass` albo brak błędów krytycznych.
- [ ] `admin.html?v=20260710-v73-stable-control` pokazuje źródła danych.
- [ ] `?admin=1&v=20260710-v73-stable-control` otwiera panel PDF QA.
- [ ] Strona bez `?admin=1` nie pokazuje panelu admina.
- [ ] Wyszukiwanie po `YT-82806` działa, jeśli indeks jest w bazie.
- [ ] Wyszukiwanie bez myślnika działa.
- [ ] Dla urządzenia z PDF-em pokazuje się rysunek złożeniowy.
- [ ] Link „Otwórz w nowej karcie” działa.
- [ ] Część można dodać do koszyka.
- [ ] Tryb ręcznego opisu części działa przy braku listy pozycji.
- [ ] Gotowy mail ma adres `service@yato.pl`.
- [ ] W mailu nie ma cen ani stanów magazynowych.
- [ ] `npm run check` przechodzi lokalnie albo w GitHub Actions.

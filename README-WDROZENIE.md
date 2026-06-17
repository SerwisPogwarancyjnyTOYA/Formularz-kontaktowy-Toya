# Wdrożenie v47

## Najbezpieczniej

1. Zmień nazwę starego katalogu repo, np. `yato-service-hub-repo-STARE`.
2. Sklonuj repo od nowa w GitHub Desktop.
3. Usuń zawartość katalogu roboczego, ale nie usuwaj `.git`.
4. Wklej zawartość paczki v47.
5. Commit: `Deploy v47 mobile parts flow`.
6. Push origin.

## Po wdrożeniu

Adres testowy:

```text
https://serwispogwarancyjnytoya.github.io/Formularz-kontaktowy-Toya/?v=20260617-v47-mobile-parts
```

## Uwaga o ciężarze repo

Repo nie powinno zawierać 1400+ PDF-ów. PDF-y zostają w Google Drive, a repo trzyma tylko kod i JSON-y.


## v47 — dane klienta i walidacje

- dodany ekran kontroli przed skopiowaniem maila,
- poprawiona walidacja email/telefon/kod pocztowy/NIP,
- faktura i wysyłka nadal są opcjonalne,
- przycisk „Kopiuj komplet” kopiuje adresata, temat i treść razem.

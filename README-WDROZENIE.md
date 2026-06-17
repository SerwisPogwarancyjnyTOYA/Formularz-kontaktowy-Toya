# Wdrożenie v41

1. Zrób backup obecnego katalogu repo.
2. Utwórz świeży katalog repo albo sklonuj repo od nowa.
3. Usuń wszystko poza `.git`.
4. Wklej zawartość tej paczki.
5. Wykonaj commit i push.

Po wdrożeniu testuj z parametrem cache:

```text
https://serwispogwarancyjnytoya.github.io/Formularz-kontaktowy-Toya/?v=20260617-v41-functional-flow
```

## Komendy pomocnicze

```bash
bash scripts/audit-repo.sh
bash scripts/clean-macos-junk.sh
```

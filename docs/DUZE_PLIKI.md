# Duże pliki ZIP z rysunkami

Nie commitować do GitHuba plików `ezyZip.z01`, `ezyZip.z02`, ..., `ezyZip.zip` ani innych paczek powyżej 100 MB.

GitHub blokuje pliki powyżej 100 MB. Rysunki trzeba rozpakować poza repo, posegregować i dopiero potem wrzucać do `drawings/` jako pliki produkcyjne albo zostawić w Google Drive i podpiąć przez `data/drawings.json`.

Docelowa struktura:

```text
drawings/
├── YATO/
├── VOREL/
├── STHOR/
├── LUND/
├── FLO/
├── FALA/
└── unmapped/
```

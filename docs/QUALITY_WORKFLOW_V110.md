# PGW v110 - Workflow Engine

## Architektura
1. Audyty cząstkowe trafiają do `data/`.
2. `npm run audit-ingest-v110` scala je do znormalizowanego rejestru.
3. Quality Center pokazuje status, kompletność, priorytet i ryzyka.
4. Rebuild Studio zamienia braki na wykonywalne zlecenia.
5. Gap Register oddziela brak potwierdzenia TOYA24 od faktycznego braku.
6. `npm run release-v110-check` blokuje READY bez zdjęcia, rysunku albo listy części.

## Polecenia
```bash
npm run audit-ingest-v110
npm run quality-center-check
npm run release-v110-check
npm run publication-pipeline-v110
```

## Bezpieczeństwo
- brak wymyślania SAP, PL, EN i numeracji,
- dokumenty robocze pozostają zablokowane,
- publiczna mapa nie jest modyfikowana przez workflow engine,
- commit/push nie są deklarowane bez dowodu.

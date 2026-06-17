# PGW Service Hub v53 — pełny manifest + rozpoznawanie marek

v53 nie próbuje udawać, że wszystkie marki da się potwierdzić automatem.

Wprowadzone zmiany:

- rozbicie PDF-ów wielomodelowych na osobne wpisy modeli,
- automatyczne potwierdzenie modeli z prefiksem `YT` jako YATO,
- pozostawienie niepewnych modeli jako `DO ROZPOZNANIA`,
- osobny ekran `brand-review.html` do pracy wewnętrznej,
- plik `data/brand-resolution-overrides.json` do ręcznego potwierdzania marek,
- skrypt `scripts/apply-brand-overrides.py` do trwałego zastosowania potwierdzeń.

Zasada: marka potwierdzona tylko wtedy, gdy jest prefiks, folder, seed albo ręczne nadpisanie.

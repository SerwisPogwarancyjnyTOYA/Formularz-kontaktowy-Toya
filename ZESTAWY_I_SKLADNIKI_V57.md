# V57 — zestawy i składniki pozycji z rysunku

Wersja dodaje warstwę relacji: część pojedyncza → zestaw/komplet, w którym występuje.

Przykład: `YT-828390`, okrzesywarka:

- `ZY828390-102` — ZĘBATKA
- `ZY828390-103` — KOŁO ŚLIMAKOWE
- `ZY828390-104` — TULEJA TŁOKA
- `ZY828390-105` — OBUDOWA POMPKI OLEJU
- `ZY828390-105A` — POMPKA OLEJU KOMPLETNA, pozycje `2,3,4,5`

Klient wybiera konkretną część, a aplikacja automatycznie dopisuje do koszyka i maila ostrzeżenie serwisowe:

> Wybrany element jest składnikiem zestawu/kompletu. Sprawdzić dostępność elementu pojedynczego oraz kompletnego zestawu.

## Dane

- `data/part-assemblies.v57.json`
- `data/part-assemblies.v57.csv`

## Statystyka

- liczba wykrytych zestawów/kompletów: 13
- liczba powiązań składnik → zestaw: 71

Logika jest ostrożna: dla zakresów typu `2,3,4,5` używa też podobieństwa indeksu, żeby nie podpiąć przypadkowych pozycji z innych sekcji tego samego PDF-a.

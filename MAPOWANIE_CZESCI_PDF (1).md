# Mapowanie części na PDF — kierunek techniczny

Docelowo można rozważyć mapowanie części bezpośrednio na obrazie rysunku, ale nie warto trzymać tych obrazów w repo.

## Dlaczego nie repo?

Konwersja 1400+ PDF-ów do PNG/JPG i wycinanie elementów może urosnąć do wielu GB, nawet około 10–12 GB. GitHub Pages i Git nie są dobrym miejscem na takie zasoby.

## Lepszy kierunek

1. PDF-y zostają w Google Drive.
2. Dla wybranych, najczęstszych modeli tworzymy lekkie metadane hotspotów w JSON:
   - model,
   - numer pozycji,
   - współrzędne procentowe,
   - indeks części.
3. Obraz/preview PDF może być generowany osobno i hostowany poza repo, np. Drive/CDN.
4. Strona ładuje tylko JSON z mapą i pokazuje nakładkę/hotspoty dla modeli, które mają mapowanie.

## Etap teraz

v46 poprawia wybór po pozycji z PDF. Klient patrzy na PDF, wpisuje numer pozycji i dodaje część z listy.

## Etap później

Ręczne mapowanie 10–20 najczęstszych modeli, a nie całych 1400 naraz.

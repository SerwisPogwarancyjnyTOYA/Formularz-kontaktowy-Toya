# PGW Service Hub v48 — wersja do pokazania kierunkowo

v48 dopracowuje wygląd i wygodę formularza bez dokładania ciężkich plików do repozytorium.

## Co klient widzi

- prostą ścieżkę: urządzenie → PDF → części → dane → gotowy mail,
- opcjonalne dane do faktury i wysyłki,
- tryb ręczny, gdy urządzenia nie ma w aktualnej bazie,
- tryb jasny albo ciemny.

## Co ważne technicznie

- repo pozostaje lekkie,
- PDF-y są nadal w Google Drive,
- publiczna strona nie pokazuje cen ani stanów,
- tryb ciemny nie wymaga backendu i zapisuje się lokalnie w przeglądarce.

## Następny etap

v49 powinien skupić się na pełnym manifeście Google Drive dla 1400+ PDF-ów albo na dalszym dopracowaniu UX części i trybu ręcznego.

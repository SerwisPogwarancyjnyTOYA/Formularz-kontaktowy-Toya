# v58 — czysty widok klienta

Ta wersja usuwa robocze etykiety z interfejsu klienta i poprawia ścieżkę dla PDF-ów bez podpiętej listy części.

## Poprawione

- Ukryto widoczne nazwy wersji roboczych w UI.
- Ukryto monitor bazy, liczniki techniczne i narzędzia rozpoznawania marek.
- Zmieniono komunikat „urządzenie spoza aktualnej bazy” na „lista części do uzupełnienia”.
- PDF z Drive pokazuje się także wtedy, gdy lista części nie jest jeszcze spięta z formularzem.
- ZUN-y pozostają ukryte dla klienta, ale są automatycznie dopisywane do maila dla serwisu.
- Relacje składnik → komplet są dopisywane do maila dla serwisu.
- Poprawiono mobilny widok tabeli części.

## Zasada

To, co jest robocze dla serwisu, nie pojawia się jako komunikat dla klienta.

# PGW Service Hub v32 — bez cen i stanów na stronie

Ta wersja usuwa z publicznego widoku strony informacje o cenach i dostępności/stanach magazynowych.

## Co zmieniono

- usunięto kolumnę **Cena** z tabel części,
- usunięto pola **Cena** i **Dostępność** ze szczegółów części,
- usunięto badge **cena w bazie**,
- usunięto priorytetowanie wyników po cenie/stanie,
- usunięto cenę z generowanego zapytania,
- uproszczono tekst hero oraz placeholder uwag,
- usunięto pola cenowe i stanowe z publicznych plików JSON w paczce, żeby klient nie mógł podejrzeć tych danych w źródle.

## Ważne

Strona nadal pozwala klientowi wskazać części i przygotować zapytanie. Dane handlowe mają być potwierdzane dopiero przez serwis po otrzymaniu zgłoszenia.

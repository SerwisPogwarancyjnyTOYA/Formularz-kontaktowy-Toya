YATO Service Hub — demo lokalne

Jak uruchomić:
1. Rozpakuj folder.
2. Otwórz plik index.html w Chrome/Edge/Safari.
3. Kliknij „Wypełnij przykład: łańcuch do piły” albo wyszukaj: YT-84920, łańcuch, YG-03395, YT-82560.

Co działa w demo:
- wyszukiwarka urządzeń i części,
- mock rysunku złożeniowego z klikalnymi pozycjami,
- koszyk części pogwarancyjnych,
- formularz danych klienta,
- generowanie gotowego maila,
- mailto do service@yato.pl,
- eksport JSON.

Czego demo jeszcze nie robi:
- nie wysyła maili automatycznie z serwera,
- nie ma logowania i panelu admina,
- nie ma prawdziwej bazy rysunków,
- nie ma produkcyjnego backendu.

Jak zrobić produkcyjnie:
- frontend: Next.js / React albo prostsze Astro,
- hosting: Cloudflare Pages / Vercel,
- baza: Supabase Postgres,
- pliki rysunków: Cloudflare R2 / Google Drive API / Supabase Storage,
- maile: Resend / SendGrid / Microsoft Graph / Gmail API,
- zgłoszenia: panel admina + statusy.

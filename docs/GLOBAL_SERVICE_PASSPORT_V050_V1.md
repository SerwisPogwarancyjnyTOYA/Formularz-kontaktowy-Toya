# TOYA Global Service Passport 0.5.0.v1

## Doświadczenie klienta
Język wybierany jest w nagłówku. Paszport serwisowy pozwala utworzyć bezpieczny link, kod sprawy, wydruk/PDF oraz wiadomość e-mail. Link nie zawiera danych kontaktowych, fakturowych, wysyłkowych ani uwag.

## URL
- `?lang=en` - język,
- `?model=YT-85205` - otwarcie modelu,
- `#pgw=<payload>` - bezpieczny payload modelu i części.

## Offline
Service worker zapisuje powłokę aplikacji i ostatnie poprawnie pobrane dane katalogowe. PDF-y Google Drive wymagają połączenia.

## Release gate
Publiczny patch zawiera wyłącznie rekordy kompletne: zdjęcie, rysunek, lista części, QA PAGE_BY_PAGE i status PUBLIC_READY.

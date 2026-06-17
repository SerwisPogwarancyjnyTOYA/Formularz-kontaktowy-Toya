# APK / aplikacja Android — plan

Z obecnej strony da się zrobić aplikację na telefon na trzy sposoby.

## 1. PWA — najszybciej
Strona działa jak aplikacja instalowana z przeglądarki: „Dodaj do ekranu głównego”.
- brak Play Store, brak APK, najszybsze testy,
- może otwierać domyślną pocztę przez `mailto:`,
- działa z aktualnym GitHub Pages.

## 2. APK jako WebView / Capacitor
To najrozsądniejszy APK z tego, co już mamy. Aplikacja pakuje stronę w kontener Androida.
- ma ikonę na telefonie,
- może odpalać domyślną aplikację poczty z gotowym mailem,
- później można dodać wybór zdjęć i przekazanie ich jako załączniki,
- APK zwykle będzie wielokrotnie lżejszy niż repo z PDF-ami, bo PDF-y nadal siedzą w Drive.

## 3. Pełna natywna aplikacja
Najwięcej pracy. Sens dopiero gdy formularz będzie sprawdzony przez klientów.

## Ważne
Aplikacja bez backendu nie powinna wysyłać maili „po cichu”. Najbezpieczniej i najczyściej: tworzy gotową wiadomość i otwiera domyślną pocztę użytkownika.

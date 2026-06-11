// PGW Service Hub — konfiguracja hostingu rysunków
// Tryb docelowy: CDN/R2. GitHub trzyma aplikację i indeksy JSON, rysunki żyją poza repo.
window.PGW_CONFIG = {
  version: '20260611-v25-storage',

  // auto: jeśli rekord ma driveFileId/viewerUrl/cdnUrl/url użyje ich; w przeciwnym razie spróbuje lokalnej ścieżki z repo.
  // cdn: wymusza budowanie adresu z drawingsBaseUrl + drawing.path.
  // drive: wymusza Google Drive preview, jeżeli rekord ma driveFileId.
  // local: tylko ścieżki z repo.
  storageMode: 'auto',

  // Docelowo tu wpisujemy publiczny adres CDN/R2, np.:
  // drawingsBaseUrl: 'https://rysunki-pgw.toya24.pl/',
  // albo: 'https://pub-xxxx.r2.dev/'
  drawingsBaseUrl: '',

  // Gdy true, aplikacja preferuje adres z CDN/Drive przed lokalnym plikiem w repo.
  preferExternalDrawings: true,

  // Opcjonalny tekst w UI, żeby od razu było widać skąd idą rysunki.
  storageLabel: 'rysunki: auto'
};

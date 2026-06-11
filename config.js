window.PGW_CONFIG = {
  // Na etap pilotażu trzymamy rysunki na Google Drive.
  // Repo GitHub zawiera tylko aplikację i indeksy JSON.
  storageMode: 'drive',
  preferExternalDrawings: true,
  demoDevices: ['YT-827795', 'YT-852371', 'YT-85177', '00610'],
  drawingsBaseUrl: '',
  storageLabel: 'Google Drive',
  driveSearchFallback: true,
  driveSearchBaseUrl: 'https://drive.google.com/drive/search?q=',
  driveMapUrls: ['data/drive-drawings-map.json', 'drive-drawings-map.json']
};

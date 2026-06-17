window.PGW_CONFIG = {
  version: '20260617-v51-full-drive-exporter',
  appName: 'PGW Service Hub',
  recipientEmail: 'service@yato.pl',
  storageMode: 'drive',
  pdfOnly: true,
  showPrices: false,
  showStock: false,
  autosave: true,
  partRowLimit: 80,
  enableVatLookup: true,
  enableManualFallback: true,
  enableMappingTools: true,
  vatLookupProvider: 'mf-wl',
  postalCodesUrl: 'data/postal-codes.json',
  dataUrls: {
    devices: ['data/devices.json'],
    drawings: ['data/drawings.json'],
    parts: ['data/parts.json'],
    driveMap: ['data/drive-drawings-map.full.json', 'data/drive-drawings-map.json']
  }
};

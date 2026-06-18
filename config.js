window.PGW_CONFIG = {
  version: '20260618-v66-pdf-header-extractor',
  appName: 'Formularz zapytania o części',
  recipientEmail: 'service@yato.pl',
  storageMode: 'drive',
  pdfOnly: true,
  showPrices: false,
  showStock: false,
  autosave: true,
  partRowLimit: 80,
  enableVatLookup: true,
  enableManualFallback: true,
  enableMappingTools: false,
  vatLookupProvider: 'mf-wl',
  postalCodesUrl: 'data/postal-codes.json',
  dataUrls: {
    devices: ['data/devices.json'],
    drawings: ['data/drawings.json'],
    parts: ['data/parts.json'],
    driveMap: ['data/drive-drawings-map.full.json'],
    brandOverrides: ['data/brand-resolution-overrides.json'],
    pdfHeaderOverrides: ['data/pdf-header-overrides.json'],
    universalParts: ['data/universal-parts-zun.json'],
    universalPartLinks: ['data/universal-parts-zun-links.json'],
    partAssemblies: ['data/part-assemblies.json']
  }
};

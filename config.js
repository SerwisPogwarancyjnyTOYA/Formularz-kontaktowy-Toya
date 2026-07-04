window.PGW_CONFIG = {
  version: '20260703-final-presentation-build',
  appName: 'Formularz zapytania o części',
  recipientEmail: 'service@yato.pl',
  storageMode: 'github-pages-static',
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
    devices: ['data/devices.json?v=20260704-hotfix1'],
    drawings: ['data/drawings.json?v=20260704-hotfix1'],
    parts: ['data/parts.json?v=20260704-hotfix1'],
    driveMap: ['data/drive-drawings-map.full.json?v=20260704-hotfix1'],
    brandOverrides: ['data/brand-resolution-overrides.json'],
    pdfHeaderOverrides: ['data/pdf-header-overrides.json'],
    universalParts: ['data/universal-parts-zun.json'],
    universalPartLinks: ['data/universal-parts-zun-links.json'],
    partAssemblies: ['data/part-assemblies.json']
  }
};

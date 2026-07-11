window.PGW_CONFIG = {
<<<<<<< HEAD
  version: '20260711-v78-drive-first-catalog-builder',
  appName: 'Formularz zapytania o części',
  recipientEmail: 'service@yato.pl',
  storageMode: 'drive',
  releaseChannel: 'stable-v78',
=======
  version: '20260711-v76-coverage-pdf-quality',
  appName: 'Formularz zapytania o części',
  recipientEmail: 'service@yato.pl',
  storageMode: 'drive',
  releaseChannel: 'stable-v76',
>>>>>>> 6e274248c413b706ad423ea78af3ec7bffc69800
  cachePolicy: 'no-store',
  enableSmokeTestTools: true,
  pdfOnly: true,
  showPrices: false,
  showStock: false,
  autosave: true,
  partRowLimit: 80,
  enableVatLookup: true,
  enableManualFallback: true,
  enableMappingTools: false,
  enableAdminPanel: true,
  adminPanelParam: 'admin',
  vatLookupProvider: 'mf-wl',
  postalCodesUrl: 'data/postal-codes.json',
  dataUrls: {
    devices: ['data/devices.json'],
    drawings: ['data/drawings.json'],
    parts: ['data/parts.json'],
    driveMap: ['data/drive-drawings-map.full.json', 'data/drive-drawings-map.converted.json', 'data/drive-drawings-map.generated-v78.json', 'data/drive-drawings-map.json'],
    pdfDeviceOverrides: ['data/pdf-device-overrides.json'],
    pdfQualityReport: ['data/pdf-quality-report.json'],
    pdfOrphans: ['data/pdf-orphans.json'],
    pdfQaRules: ['data/pdf-qa-rules.json'],
    pdfOverrideCandidates: ['data/pdf-override-candidates.json'],
      pdfDisplayPolicy: ['data/pdf-display-policy.json'],
      pdfStandardizationAudit: ['data/pdf-standardization-audit.json'],
    coverageAuditV76: ['data/coverage-audit-v76.json'],
    pdfQualityAuditV76: ['data/pdf-quality-audit-v76.json'],
    formCatalogPolicyV76: ['data/form-catalog-policy-v76.json'],
<<<<<<< HEAD
    driveFirstCatalogAuditV78: ['data/drive-first-catalog-audit-v78.json'],
    driveCatalogPolicyV78: ['data/drive-catalog-policy-v78.json'],
=======
>>>>>>> 6e274248c413b706ad423ea78af3ec7bffc69800
    deploymentState: ['data/deployment-state.json'],
    releaseInfo: ['data/release-info.json'],
    brandOverrides: ['data/brand-resolution-overrides.json'],
    pdfHeaderOverrides: ['data/pdf-header-overrides.json'],
    universalParts: ['data/universal-parts-zun.json'],
    universalPartLinks: ['data/universal-parts-zun-links.json'],
    partAssemblies: ['data/part-assemblies.json']
  }
};

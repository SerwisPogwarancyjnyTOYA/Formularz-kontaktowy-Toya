window.PGW_CONFIG = {
<<<<<<< HEAD
  version: '20260711-v80-drive-master-catalog',
  appName: 'Formularz zapytania o części',
  recipientEmail: 'service@yato.pl',
  storageMode: 'drive',
  releaseChannel: 'stable-v80',
=======
  version: '20260711-v79-drive-catalog-and-pdf-organizer',
  appName: 'Formularz zapytania o części',
  recipientEmail: 'service@yato.pl',
  storageMode: 'drive',
  releaseChannel: 'stable-v79',
>>>>>>> 430369623cb40f6169e1a404231d5cd39d752ab3
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
<<<<<<< HEAD
    driveMap: ['data/drive-drawings-map.full.json', 'data/drive-drawings-map.converted.json', 'data/drive-drawings-map.generated-v80.json', 'data/drive-drawings-map.generated-v79.json', 'data/drive-drawings-map.generated-v78.json', 'data/drive-drawings-map.json'],
=======
    driveMap: ['data/drive-drawings-map.full.json', 'data/drive-drawings-map.converted.json', 'data/drive-drawings-map.generated-v79.json', 'data/drive-drawings-map.generated-v78.json', 'data/drive-drawings-map.json'],
>>>>>>> 430369623cb40f6169e1a404231d5cd39d752ab3
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
    driveFirstCatalogAuditV78: ['data/drive-first-catalog-audit-v78.json'],
    driveCatalogPolicyV78: ['data/drive-catalog-policy-v78.json'],
    driveCatalogAuditV79: ['data/drive-catalog-audit-v79.json'],
    drivePdfMergeQueueV79: ['data/drive-pdf-merge-queue-v79.json'],
    driveOrganizerPlanV79: ['data/drive-organizer-plan-v79.json'],
<<<<<<< HEAD
    driveMasterAuditV80: ['data/drive-master-audit-v80.json'],
    driveMergePlanV80: ['data/drive-merge-plan-v80.json'],
    driveOrganizerActionsV80: ['data/drive-organizer-actions-v80.json'],
=======
>>>>>>> 430369623cb40f6169e1a404231d5cd39d752ab3
    deploymentState: ['data/deployment-state.json'],
    releaseInfo: ['data/release-info.json'],
    brandOverrides: ['data/brand-resolution-overrides.json'],
    pdfHeaderOverrides: ['data/pdf-header-overrides.json'],
    universalParts: ['data/universal-parts-zun.json'],
    universalPartLinks: ['data/universal-parts-zun-links.json'],
    partAssemblies: ['data/part-assemblies.json']
  }
};

/**
 * PGW v72 — PDF Quality Control po konwersji.
 *
 * Co robi:
 * - skanuje foldery z rysunkami PDF,
 * - generuje data/drive-drawings-map.converted.json,
 * - generuje data/pdf-orphans.json dla PDF-ów bez rozpoznanego indeksu,
 * - generuje data/pdf-quality-report.json z podsumowaniem,
 * - czyta data/pdf-device-overrides.json i stosuje ręczne przypisania.
 */
const PGW_PDF_QA_V72 = {
  sourceFolderIds: [
    '1wYvMsfwtz8jPvAaKW4W13au77lUAu3Gu', // Rysunki wybuchowe
    '1OQbwZZnV3VdJOkkqi1qtXNUiuBx5BycF', // PGW - Rysunki
    '1Ca8zKCBnArP4DfQGFazS0dXfHb0H902u'  // 02_RYSUNKI_ZLOZENIOWE_BAZA
  ],
  repoDataFolderId: '1xOV2c7bj5E5W0rH9TwVtwme5m4eX8nnq',
  manifestFileName: 'drive-drawings-map.converted.json',
  orphansFileName: 'pdf-orphans.json',
  reportFileName: 'pdf-quality-report.json',
  overridesFileName: 'pdf-device-overrides.json',
  overrideCandidatesFileName: 'pdf-override-candidates.json',
  deploymentStateFileName: 'deployment-state.json',
  releaseInfoFileName: 'release-info.json',
  backupFolderName: '_generated-backups',
  maxFilesPerRun: 12000
};

function pgwRefreshPdfManifestAfterConversionV72() {
  const started = new Date();
  const overrides = readRepoJson_(PGW_PDF_QA_V72.repoDataFolderId, PGW_PDF_QA_V72.overridesFileName, {});
  const rows = [];
  const seen = {};

  PGW_PDF_QA_V72.sourceFolderIds.forEach(function(folderId) {
    const folder = DriveApp.getFolderById(folderId);
    scanPdfFolderV72_(folder, folder.getName(), rows, seen, overrides);
  });

  const deduped = dedupePdfRowsV72_(rows);
  const visible = deduped.filter(function(row) { return row.deviceIndex; });
  const orphans = deduped.filter(function(row) { return !row.deviceIndex; }).map(function(row) {
    row.reason = row.reason || 'Nie rozpoznano indeksu urządzenia z nazwy/pliku/ścieżki ani z override.';
    return row;
  });

  visible.sort(function(a, b) {
    return String(a.normalizedModel || a.title).localeCompare(String(b.normalizedModel || b.title), 'pl');
  });
  orphans.sort(function(a, b) {
    return String(a.path + '/' + a.title).localeCompare(String(b.path + '/' + b.title), 'pl');
  });

  const manifestPayload = {
    generatedAt: started.toISOString(),
    updatedAt: new Date().toISOString(),
    version: '20260710-v72-pdf-quality-control',
    sourceFolderIds: PGW_PDF_QA_V72.sourceFolderIds,
    count: visible.length,
    notes: 'Manifest PDF po konwersji. Zawiera tylko rekordy z rozpoznanym albo ręcznie przypisanym indeksem urządzenia.',
    items: visible
  };

  const orphanPayload = {
    generatedAt: started.toISOString(),
    version: '20260710-v72-pdf-quality-control',
    count: orphans.length,
    notes: 'PDF-y wyglądające na rysunki, ale bez indeksu urządzenia. Uzupełnij data/pdf-device-overrides.json, jeżeli mają być widoczne w formularzu.',
    items: orphans
  };

  const reportPayload = {
    generatedAt: started.toISOString(),
    version: '20260710-v72-pdf-quality-control',
    summary: {
      scannedPdf: rows.length,
      afterDeduplication: deduped.length,
      visiblePdf: visible.length,
      orphans: orphans.length,
      duplicates: rows.length - deduped.length,
      manualOverridesApplied: visible.filter(function(r) { return r.overrideSource; }).length
    },
    topProblems: orphans.slice(0, 100).map(function(r) {
      return {
        fileName: r.fileName,
        path: r.path,
        openUrl: r.openUrl,
        reason: r.reason
      };
    })
  };

  backupGeneratedJsonV72_(PGW_PDF_QA_V72.repoDataFolderId, [PGW_PDF_QA_V72.manifestFileName, PGW_PDF_QA_V72.orphansFileName, PGW_PDF_QA_V72.reportFileName, PGW_PDF_QA_V72.overrideCandidatesFileName, PGW_PDF_QA_V72.deploymentStateFileName]);

  const overrideCandidatesPayload = buildOverrideCandidatesV72_(orphans, deduped);
  const deploymentStatePayload = buildDeploymentStateV72_(started, reportPayload);
  const releaseInfoPayload = buildReleaseInfoV72_(started, reportPayload);

  upsertRepoJsonV72_(PGW_PDF_QA_V72.repoDataFolderId, PGW_PDF_QA_V72.manifestFileName, manifestPayload);
  upsertRepoJsonV72_(PGW_PDF_QA_V72.repoDataFolderId, PGW_PDF_QA_V72.orphansFileName, orphanPayload);
  upsertRepoJsonV72_(PGW_PDF_QA_V72.repoDataFolderId, PGW_PDF_QA_V72.reportFileName, reportPayload);
  upsertRepoJsonV72_(PGW_PDF_QA_V72.repoDataFolderId, PGW_PDF_QA_V72.overrideCandidatesFileName, overrideCandidatesPayload);
  upsertRepoJsonV72_(PGW_PDF_QA_V72.repoDataFolderId, PGW_PDF_QA_V72.deploymentStateFileName, deploymentStatePayload);
  upsertRepoJsonV72_(PGW_PDF_QA_V72.repoDataFolderId, PGW_PDF_QA_V72.releaseInfoFileName, releaseInfoPayload);

  Logger.log('PGW PDF QA v72: scanned=%s visible=%s orphans=%s duplicates=%s overrides=%s',
    reportPayload.summary.scannedPdf,
    reportPayload.summary.visiblePdf,
    reportPayload.summary.orphans,
    reportPayload.summary.duplicates,
    reportPayload.summary.manualOverridesApplied
  );
  return reportPayload;
}

function scanPdfFolderV72_(folder, path, rows, seen, overrides) {
  if (rows.length >= PGW_PDF_QA_V72.maxFilesPerRun) return;

  const files = folder.getFilesByType(MimeType.PDF);
  while (files.hasNext()) {
    if (rows.length >= PGW_PDF_QA_V72.maxFilesPerRun) break;
    const file = files.next();
    const fileId = file.getId();
    if (seen[fileId]) continue;
    seen[fileId] = true;

    const title = file.getName();
    if (!looksLikeAssemblyDrawingPdfV72_(title, path)) continue;

    const detectedModel = extractDeviceIndexV72_(title) || extractDeviceIndexV72_(path);
    const row = buildPdfRowV72_(file, path, detectedModel);
    applyPdfOverrideV72_(row, overrides);
    if (!row.deviceIndex) row.reason = 'Brak indeksu w nazwie/ścieżce i brak ręcznego override.';
    rows.push(row);
  }

  const folders = folder.getFolders();
  while (folders.hasNext()) {
    const child = folders.next();
    scanPdfFolderV72_(child, path + '/' + child.getName(), rows, seen, overrides);
  }
}

function buildPdfRowV72_(file, path, model) {
  const fileId = file.getId();
  const title = file.getName();
  const normalized = normalizeDeviceIndexV72_(model);
  return {
    fileId: fileId,
    title: title,
    fileName: title,
    mimeType: MimeType.PDF,
    type: 'pdf',
    model: normalized,
    deviceIndex: normalized,
    normalizedModel: normalized,
    viewerUrl: 'https://drive.google.com/file/d/' + encodeURIComponent(fileId) + '/view?usp=drivesdk',
    previewUrl: 'https://drive.google.com/file/d/' + encodeURIComponent(fileId) + '/preview',
    openUrl: 'https://drive.google.com/file/d/' + encodeURIComponent(fileId) + '/view',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=' + encodeURIComponent(fileId),
    path: path,
    folderName: path.split('/').pop(),
    createdTime: file.getDateCreated().toISOString(),
    modifiedTime: file.getLastUpdated().toISOString(),
    keys: buildKeysV72_(title, normalized),
    source: 'POST_CONVERSION_DRIVE_SCAN_V72',
    status: normalized ? 'OK' : 'MODEL_DO_ROZPOZNANIA',
    brand: inferBrandV72_(title + ' ' + path + ' ' + normalized),
    brandConfidence: normalized ? 'filename_or_path' : 'unknown',
    reviewStatus: normalized ? 'visible_after_conversion' : 'needs_model_review'
  };
}

function applyPdfOverrideV72_(row, overrides) {
  const override = findPdfOverrideV72_(row, overrides || {});
  if (!override) return;
  const deviceIndexes = Array.isArray(override) ? override : (override.deviceIndexes || override.deviceIndex || override.model || override.models || '');
  const primary = Array.isArray(deviceIndexes) ? deviceIndexes[0] : deviceIndexes;
  if (primary) {
    row.deviceIndex = normalizeDeviceIndexV72_(primary);
    row.model = row.deviceIndex;
    row.normalizedModel = row.deviceIndex;
    row.status = 'OK_OVERRIDE';
    row.reviewStatus = 'manual_override';
    row.overrideSource = 'pdf-device-overrides.json';
    row.keys = buildKeysV72_(row.title, row.deviceIndex).concat(arrayV72_(deviceIndexes).map(normalizeDeviceIndexV72_));
  }
  if (!Array.isArray(override) && typeof override === 'object') {
    if (override.deviceName) row.deviceName = override.deviceName;
    if (override.displayTitle) row.displayTitle = override.displayTitle;
    if (override.brand) row.brand = override.brand;
    if (override.notes) row.notes = override.notes;
  }
}

function findPdfOverrideV72_(row, overrides) {
  const sources = [
    overrides.byFileId || {},
    overrides.byFileName || {},
    overrides.byTitle || {},
    overrides.byPath || {},
    overrides.byModel || {},
    overrides.models || {},
    overrides.files || {},
    overrides
  ];
  const candidates = uniqueV72_([
    row.fileId, row.fileName, row.title, row.path, row.deviceIndex, row.model,
    normalizeDeviceIndexV72_(row.fileName), normalizeDeviceIndexV72_(row.title),
    normKeyV72_(row.fileName), stripExtV72_(normKeyV72_(row.fileName)),
    normKeyV72_(row.title), stripExtV72_(normKeyV72_(row.title))
  ].filter(Boolean));
  for (let i = 0; i < sources.length; i++) {
    const src = sources[i];
    for (let j = 0; j < candidates.length; j++) {
      const key = candidates[j];
      const variants = uniqueV72_([key, String(key).toUpperCase(), String(key).toLowerCase(), normKeyV72_(key), stripExtV72_(normKeyV72_(key)), normalizeDeviceIndexV72_(key)].filter(Boolean));
      for (let k = 0; k < variants.length; k++) if (src && src[variants[k]]) return src[variants[k]];
    }
  }
  return null;
}

function dedupePdfRowsV72_(rows) {
  const out = [];
  const byIdentity = {};
  rows.forEach(function(row) {
    const identity = row.fileId || [row.path, row.fileName, row.deviceIndex].map(normKeyV72_).join('|');
    if (!byIdentity[identity]) {
      byIdentity[identity] = row;
      out.push(row);
    } else if (scorePdfRowV72_(row) > scorePdfRowV72_(byIdentity[identity])) {
      const idx = out.indexOf(byIdentity[identity]);
      byIdentity[identity] = row;
      if (idx >= 0) out[idx] = row;
    }
  });
  return out;
}

function scorePdfRowV72_(row) {
  let score = 0;
  if (row.overrideSource) score += 50;
  if (row.deviceIndex) score += 30;
  if (row.previewUrl) score += 10;
  if (row.brand && row.brand !== 'INNE') score += 5;
  return score * 10000000000000 + (Date.parse(row.modifiedTime || 0) || 0);
}


function buildOverrideCandidatesV72_(orphans, allRows) {
  const items = (orphans || []).slice(0, 500).map(function(row) {
    return {
      fileId: row.fileId || '',
      fileName: row.fileName || row.title || '',
      path: row.path || '',
      guessedDeviceIndex: extractDeviceIndexV72_(row.fileName || row.title || row.path) || '',
      suggestedOverride: row.fileId ? 'byFileId.' + row.fileId : 'byFileName.' + (row.fileName || row.title || ''),
      openUrl: row.openUrl || '',
      reason: row.reason || 'MODEL_DO_ROZPOZNANIA'
    };
  });
  return {
    generatedAt: new Date().toISOString(),
    version: '20260710-v72-publish',
    count: items.length,
    notes: 'Kandydaci do uzupełnienia w data/pdf-device-overrides.json.',
    items: items
  };
}

function buildDeploymentStateV72_(started, reportPayload) {
  const s = reportPayload.summary || {};
  const warnings = [];
  if (s.orphans) warnings.push('Są PDF-y bez rozpoznanego indeksu: ' + s.orphans);
  if (s.duplicates) warnings.push('Wykryto duplikaty PDF: ' + s.duplicates);
  return {
    generatedAt: new Date().toISOString(),
    startedAt: started.toISOString(),
    version: '20260710-v72-publish',
    status: warnings.length ? 'STAGING_WITH_WARNINGS' : 'READY_FOR_TEST',
    recommendedTestUrl: '?admin=1&v=20260710-v72-publish',
    warnings: warnings,
    summary: s,
    nextManualSteps: [
      'Wgraj wygenerowane pliki data/*.json do repo, jeśli Drive Desktop/GitHub ich nie zsynchronizował.',
      'Otwórz stronę z cache-busterem recommendedTestUrl.',
      'W panelu PDF QA pobierz release-health oraz source-health przed produkcją.'
    ]
  };
}

function buildReleaseInfoV72_(started, reportPayload) {
  return {
    generatedAt: new Date().toISOString(),
    version: '20260710-v72-publish',
    name: 'PGW v72 — Release Control',
    source: 'Apps Script pgwRefreshPdfManifestAfterConversionV72',
    summary: reportPayload.summary || {},
    changes: [
      'Backup wygenerowanych JSON-ów przed nadpisaniem.',
      'Automatyczny deployment-state.json.',
      'Automatyczny pdf-override-candidates.json.',
      'Panel admina po stronie strony pokazuje release score i źródła danych.'
    ]
  };
}

function backupGeneratedJsonV72_(repoDataFolderId, fileNames) {
  const folder = DriveApp.getFolderById(repoDataFolderId);
  let backupFolder;
  const existingFolders = folder.getFoldersByName(PGW_PDF_QA_V72.backupFolderName);
  backupFolder = existingFolders.hasNext() ? existingFolders.next() : folder.createFolder(PGW_PDF_QA_V72.backupFolderName);
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Europe/Warsaw', 'yyyyMMdd-HHmmss');
  fileNames.forEach(function(fileName) {
    const files = folder.getFilesByName(fileName);
    if (!files.hasNext()) return;
    const file = files.next();
    backupFolder.createFile(fileName.replace(/\.json$/i, '') + '.' + stamp + '.json', file.getBlob().getDataAsString('UTF-8'), MimeType.PLAIN_TEXT);
  });
}

function readRepoJson_(repoDataFolderId, fileName, fallback) {
  const folder = DriveApp.getFolderById(repoDataFolderId);
  const files = folder.getFilesByName(fileName);
  if (!files.hasNext()) return fallback;
  try {
    return JSON.parse(files.next().getBlob().getDataAsString('UTF-8'));
  } catch (e) {
    Logger.log('Nie udało się odczytać %s: %s', fileName, e.message);
    return fallback;
  }
}

function upsertRepoJsonV72_(repoDataFolderId, fileName, payload) {
  const folder = DriveApp.getFolderById(repoDataFolderId);
  const json = JSON.stringify(payload, null, 2);
  const existing = folder.getFilesByName(fileName);
  if (existing.hasNext()) existing.next().setContent(json);
  else folder.createFile(fileName, json, MimeType.PLAIN_TEXT);
}

function looksLikeAssemblyDrawingPdfV72_(title, path) {
  const text = stripDiacriticsV72_((title + ' ' + path).toLowerCase());
  if (!/\.pdf$/i.test(title)) return false;
  if (/instrukcja|manual|deklaracja|gwaranc|karta|certyfikat|etykieta|tabliczka|zdjecie|foto|image/.test(text)) return false;
  if (/czesci|zamienne|rysunki|rysunek|zlozeniowe|złożeniowe|wybuchowe|schemat|parts|spare|exploded/.test(text)) return true;
  return /\b(yt|yg)[-_ ]?\d{3,8}[a-z]?\b/i.test(text) || /\b\d{3,6}\b/.test(text);
}

function extractDeviceIndexV72_(value) {
  const raw = stripDiacriticsV72_(String(value || '')).replace(/\.[Pp][Dd][Ff]$/, '').replace(/^czesci[_ -]zamienne[_ -]*/i, ' ');
  const upper = raw.toUpperCase().replace(/_/g, '-');
  let m = upper.match(/\b(YT|YG)[- ]?(\d{3,8}[A-Z]?)\b/);
  if (m) return m[1] + '-' + m[2];
  m = upper.match(/\b\d{3,6}\b/);
  return m ? m[0] : '';
}

function normalizeDeviceIndexV72_(value) {
  return extractDeviceIndexV72_(value) || String(value || '').toUpperCase().trim();
}

function buildKeysV72_(title, model) {
  return uniqueV72_([title, stripExtV72_(title), model, normalizeDeviceIndexV72_(model)].filter(Boolean));
}

function inferBrandV72_(text) {
  const t = String(text || '').toUpperCase();
  if (/YATO\s*GASTRO|\bYG[-_ ]?0|GASTRO/.test(t)) return 'YATO GASTRO';
  if (/\bYT[-_ ]?\d|\bYATO\b/.test(t)) return 'YATO';
  if (/\bSTHOR\b/.test(t)) return 'STHOR';
  if (/\bVOREL\b/.test(t)) return 'VOREL';
  if (/\bFLO\b/.test(t)) return 'FLO';
  if (/\bLUND\b/.test(t)) return 'LUND';
  if (/\bFALA\b/.test(t)) return 'FALA';
  return 'INNE';
}

function arrayV72_(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return [value];
}

function stripDiacriticsV72_(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normKeyV72_(value) {
  return stripDiacriticsV72_(String(value || '').toLowerCase()).replace(/\\/g, '/').split('/').pop().replace(/[_\s]+/g, '-').trim();
}

function stripExtV72_(value) {
  return String(value || '').replace(/\.(pdf|jpg|jpeg|png|webp|docx?|xlsx?)$/i, '');
}

function uniqueV72_(arr) {
  const seen = {};
  return arr.filter(function(x) {
    x = String(x || '').trim();
    if (!x || seen[x]) return false;
    seen[x] = true;
    return true;
  });
}


/**
 * Opcjonalnie: uruchom raz, żeby dodać dzienny automat odświeżania manifestu PDF.
 * Google może wymagać autoryzacji skryptu przy pierwszym uruchomieniu.
 */
function pgwInstallDailyPdfManifestRefreshV72() {
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(t) {
    if (t.getHandlerFunction && t.getHandlerFunction() === 'pgwRefreshPdfManifestAfterConversionV72') {
      ScriptApp.deleteTrigger(t);
    }
  });
  ScriptApp.newTrigger('pgwRefreshPdfManifestAfterConversionV72')
    .timeBased()
    .everyDays(1)
    .atHour(4)
    .create();
}

/** Menu w arkuszu/Apps Script, jeśli skrypt jest podpięty do pliku Google. */
function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu('PGW PDF')
      .addItem('Odśwież manifest PDF v72', 'pgwRefreshPdfManifestAfterConversionV72')
      .addItem('Zainstaluj dzienny automat v72', 'pgwInstallDailyPdfManifestRefreshV72')
      .addToUi();
  } catch (e) {}
}


/**
 * Aliasy publikacyjne — można wywoływać krótką nazwą bez pamiętania wersji.
 */
function pgwRefreshPdfManifestAfterConversion() {
  return pgwRefreshPdfManifestAfterConversionV72();
}

function pgwInstallDailyPdfManifestRefresh() {
  return pgwInstallDailyPdfManifestRefreshV72();
}

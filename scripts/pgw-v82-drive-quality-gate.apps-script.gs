/**
 * PGW v82 — Real Drawing Quality Gate
 * Blokuje publikację PDF-ów roboczych/listowych jako rysunków klienta.
 * Oryginałów nie kasuje; wskazuje pliki do folderu 04_NIEPRZYPISANE / kwarantanny.
 */
const PGW_V82_BLOCKED_FILE_IDS = ['13gPbzV4uNzkQURRCrRkkreJdtNZFfm5_'];

function pgwV82IsCustomerVisiblePdf_(file, path) {
  const name = String(file.getName() || '');
  const text = (name + ' ' + String(path || '')).toLowerCase();
  if (PGW_V82_BLOCKED_FILE_IDS.indexOf(file.getId()) >= 0) return false;
  const isRobocze = text.indexOf('robocze') >= 0;
  const isScalone = text.indexOf('scalone') >= 0 || text.indexOf('verified') >= 0;
  const isCanonical = text.indexOf('czesci_zamienne') >= 0 || text.indexOf('czesci zamienne') >= 0;
  const isBareModelSlug = /^yt[-_ ]?\d/i.test(name) && !isCanonical && !isScalone;
  if (isRobocze && isBareModelSlug && !isScalone) return false;
  return true;
}

function pgwV82QualityGatePreview() {
  Logger.log('v82: klientowi wolno pokazywać tylko realne rysunki / zweryfikowane komplety, nie PDF-y robocze z samą tabelą.');
  return { ok: true, blockedFileIds: PGW_V82_BLOCKED_FILE_IDS };
}

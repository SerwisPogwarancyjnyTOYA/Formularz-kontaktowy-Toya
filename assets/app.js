let PARTS = [];
let DEVICES = [];
let DRAWINGS = {};
let selectedDevice = null;
let cart = [];

const APP_VERSION = "20260609-repair1";
const SERVICE_MAIL = "service@yato.pl";
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (m) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));
const norm = (s) => String(s ?? "").toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[–—]/g, "-").replace(/\s+/g, " ").trim();
const compact = (s) => norm(s).replace(/[^A-Z0-9]/g, "");
const money = (v) => v ? String(v) : "Cena do potwierdzenia";

async function loadData() {
  try {
    const [parts, devices, drawings] = await Promise.all([
      fetch(`data/parts.json?v=${APP_VERSION}`).then((r) => r.json()),
      fetch(`data/devices.json?v=${APP_VERSION}`).then((r) => r.json()),
      fetch(`data/drawings.json?v=${APP_VERSION}`).then((r) => r.json()),
    ]);
    PARTS = Array.isArray(parts) ? parts : [];
    DEVICES = Array.isArray(devices) ? devices : [];
    DRAWINGS = drawings && typeof drawings === "object" ? drawings : {};
    setStatus(`Baza załadowana: ${PARTS.length.toLocaleString("pl-PL")} części, ${DEVICES.length.toLocaleString("pl-PL")} modeli/grup.`);
  } catch (err) {
    console.error(err);
    setStatus("Nie udało się załadować bazy. Odśwież stronę twardo: Cmd + Shift + R.", true);
  }
  renderMail();
}

function setStatus(text, error = false) {
  const el = $("results");
  if (el && !el.dataset.touched) {
    el.className = error ? "results error" : "results muted";
    el.textContent = text;
  }
}

function deviceParts(device) {
  if (!device) return [];
  const di = device.deviceIndex;
  const dk = device.drawingKey || di;
  return PARTS.filter((p) => p.deviceIndex === di || p.drawingKey === dk);
}

function partText(p) {
  return norm([p.partIndex, p.partName, p.position, p.zunIndex, p.details, p.deviceIndex, p.deviceName, p.drawingKey].join(" "));
}
function deviceText(d) {
  return norm([d.deviceIndex, d.deviceName, d.drawingKey, (d.aliases || []).join(" ")].join(" "));
}
function findDevice(deviceIndex) {
  const c = compact(deviceIndex);
  return DEVICES.find((d) => compact(d.deviceIndex) === c || compact(d.drawingKey) === c) || null;
}
function deviceFromPart(p) {
  return findDevice(p.deviceIndex) || findDevice(p.drawingKey) || {
    deviceIndex: p.deviceIndex || p.drawingKey || p.partIndex,
    deviceName: p.deviceName || `Urządzenie / rysunek ${p.deviceIndex || p.drawingKey || "do ustalenia"}`,
    brand: p.brand || "TOYA",
    partsCount: 0,
    drawingKey: p.drawingKey || p.deviceIndex,
  };
}

function search(raw) {
  const q = norm(raw);
  const cq = compact(raw);
  if (!q || !cq) return [];
  const scored = new Map();
  const put = (device, score, reason) => {
    if (!device || !device.deviceIndex) return;
    const key = device.deviceIndex;
    const old = scored.get(key);
    if (!old || score > old.score) scored.set(key, { device, score, reason });
  };

  for (const d of DEVICES) {
    let s = 0;
    const dc = compact(d.deviceIndex);
    const dkc = compact(d.drawingKey || "");
    const dt = deviceText(d);
    if (dc === cq || dkc === cq) s += 1500;
    else if (dc.includes(cq) || cq.includes(dc) || (dkc && (dkc.includes(cq) || cq.includes(dkc)))) s += 500;
    if (dt.includes(q)) s += 120;
    if (s) put(d, s, "device");
  }

  for (const p of PARTS) {
    let s = 0;
    const pc = compact(p.partIndex);
    const zc = compact(p.zunIndex);
    const dic = compact(p.deviceIndex);
    const dkc = compact(p.drawingKey);
    const pt = partText(p);

    if (pc === cq) s += 1600;
    else if (pc && (pc.includes(cq) || cq.includes(pc))) s += 700;
    if (zc && zc === cq) s += 1400;
    else if (zc && (zc.includes(cq) || cq.includes(zc))) s += 550;
    if (dic === cq || dkc === cq) s += 1200;
    else if ((dic && (dic.includes(cq) || cq.includes(dic))) || (dkc && (dkc.includes(cq) || cq.includes(dkc)))) s += 400;
    if (pt.includes(q)) s += 120;

    if (s) put(deviceFromPart(p), s, "part");
  }

  return [...scored.values()].sort((a, b) => b.score - a.score).slice(0, 40).map((x) => x.device);
}

function renderResults(list) {
  const box = $("results");
  box.dataset.touched = "1";
  if (!list.length) {
    box.className = "results muted";
    box.innerHTML = "Brak pewnego dopasowania. Wpisz pełny indeks urządzenia, indeks części, ZUN albo nazwę części.";
    return;
  }
  box.className = "results";
  box.innerHTML = list.map((d) => {
    const count = deviceParts(d).length || d.partsCount || 0;
    return `<article class="device"><div><h3>${esc(d.deviceIndex)} — ${esc(cleanDeviceName(d))}</h3><div class="meta"><span class="tag">${esc(d.brand || "TOYA")}</span><span class="tag">${count} części</span></div></div><button type="button" data-device="${esc(d.deviceIndex)}">Wybierz</button></article>`;
  }).join("");
  box.querySelectorAll("[data-device]").forEach((b) => b.addEventListener("click", () => selectDevice(b.dataset.device)));
  if (list.length === 1) selectDevice(list[0].deviceIndex);
}

function cleanDeviceName(d) {
  let n = String(d.deviceName || "").trim();
  if (!n || /do uzupełnienia/i.test(n)) n = `${d.brand || "TOYA"} ${d.deviceIndex}`;
  return n;
}

function selectDevice(deviceIndex) {
  selectedDevice = findDevice(deviceIndex) || { deviceIndex, deviceName: deviceIndex, brand: "TOYA", drawingKey: deviceIndex };
  $("deviceTitle").textContent = `${selectedDevice.deviceIndex} — ${cleanDeviceName(selectedDevice)}`;
  renderDrawing();
  renderParts();
  renderMail();
  document.querySelector(".grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function getDrawingRecord(device) {
  if (!device) return null;
  return DRAWINGS[device.deviceIndex] || DRAWINGS[device.drawingKey] || null;
}

function renderDrawing() {
  const box = $("drawingBox");
  const rec = getDrawingRecord(selectedDevice);
  if (rec && rec.hasPreview && rec.previewUrl) {
    box.className = "drawing";
    box.innerHTML = `<iframe title="Rysunek złożeniowy" src="${esc(rec.previewUrl)}"></iframe><div class="drawing-actions"><a href="${esc(rec.viewUrl || rec.previewUrl)}" target="_blank" rel="noopener"><button type="button" class="secondary">Otwórz rysunek w nowej karcie</button></a></div>`;
    return;
  }
  const url = rec?.viewUrl || rec?.driveSearchUrl || `https://drive.google.com/drive/search?q=${encodeURIComponent(selectedDevice.deviceIndex)}`;
  box.className = "drawing empty";
  box.innerHTML = `<div><b>Rysunek nie jest jeszcze aktywnie osadzony.</b><br>Lista części jest dostępna — możesz dodać pozycje do zapytania.<br><br><a href="${esc(url)}" target="_blank" rel="noopener"><button type="button">Otwórz / wyszukaj rysunek</button></a></div>`;
}

function renderParts() {
  const parts = deviceParts(selectedDevice);
  const box = $("partsList");
  if (!parts.length) {
    box.className = "parts muted";
    box.textContent = "Brak części przypisanych w lokalnej bazie.";
    return;
  }
  box.className = "parts";
  box.innerHTML = parts.map(partCard).join("");
  box.querySelectorAll("[data-add]").forEach((b) => b.addEventListener("click", () => addPart(b.dataset.add)));
}

function partCard(p) {
  return `<article class="part"><div><h4>${esc(p.partName)}</h4><div class="meta"><span class="tag">poz. ${esc(p.position || "—")}</span><span class="tag">${esc(p.partIndex)}</span>${p.zunIndex ? `<span class="tag">${esc(p.zunIndex)}</span>` : ""}<span class="tag price">${esc(money(p.priceLabel))}</span></div>${p.details ? `<p class="mutedtext">${esc(p.details)}</p>` : ""}</div><button type="button" data-add="${esc(p.id)}">Dodaj</button></article>`;
}

function addPart(id) {
  const p = PARTS.find((x) => x.id === id);
  if (!p) return;
  if (!cart.find((x) => x.id === id)) cart.push({ ...p, qty: 1 });
  renderCart();
  renderMail();
  toast("Dodano do zapytania");
}

function renderCart() {
  const box = $("cart");
  if (!cart.length) {
    box.className = "cart muted";
    box.textContent = "Koszyk jest pusty.";
    return;
  }
  box.className = "cart";
  box.innerHTML = cart.map((p) => `<div class="cartitem"><div><b>${esc(p.partName)}</b><div class="meta"><span class="tag">${esc(p.partIndex)}</span><span class="tag">poz. ${esc(p.position || "—")}</span><span class="tag price">${esc(money(p.priceLabel))}</span></div></div><button type="button" class="secondary" data-rem="${esc(p.id)}">Usuń</button></div>`).join("");
  box.querySelectorAll("[data-rem]").forEach((b) => b.addEventListener("click", () => { cart = cart.filter((x) => x.id !== b.dataset.rem); renderCart(); renderMail(); }));
}

function suggest() {
  const q = norm($("desc").value);
  const cq = compact(q);
  const box = $("suggestions");
  if (!q || !cq) {
    box.className = "results muted";
    box.textContent = "Wpisz opis albo indeks części.";
    return;
  }
  const matches = PARTS.map((p) => {
    let s = 0;
    const t = partText(p);
    const pc = compact(p.partIndex);
    const zc = compact(p.zunIndex);
    if (pc === cq) s += 1600;
    else if (pc && (pc.includes(cq) || cq.includes(pc))) s += 700;
    if (zc && zc === cq) s += 1200;
    if (t.includes(q)) s += 140;
    for (const token of q.split(" ")) if (token.length > 2 && t.includes(token)) s += 15;
    return { p, s };
  }).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 16);

  if (!matches.length) {
    box.className = "results muted";
    box.textContent = "Brak dopasowania w bazie. Spróbuj inną nazwę albo podaj indeks części.";
    return;
  }
  box.className = "results";
  box.innerHTML = matches.map(({ p }) => `<article class="suggest"><div><b>${esc(p.partName)}</b><div class="meta"><span class="tag">${esc(p.deviceIndex)}</span><span class="tag">${esc(p.partIndex)}</span><span class="tag">poz. ${esc(p.position || "—")}</span><span class="tag price">${esc(money(p.priceLabel))}</span></div></div><div class="actions"><button type="button" data-pick="${esc(p.deviceIndex)}">Urządzenie</button><button type="button" data-add="${esc(p.id)}">Dodaj</button></div></article>`).join("");
  box.querySelectorAll("[data-pick]").forEach((b) => b.addEventListener("click", () => selectDevice(b.dataset.pick)));
  box.querySelectorAll("[data-add]").forEach((b) => b.addEventListener("click", () => addPart(b.dataset.add)));
}

function formData() {
  return Object.fromEntries(new FormData($("clientForm")).entries());
}

function buildMail() {
  const f = formData();
  const lines = [];
  lines.push("Dzień dobry,");
  lines.push("proszę o potwierdzenie dostępności i realizacji zapytania o części pogwarancyjne.");
  lines.push("");
  if (selectedDevice) lines.push(`Urządzenie: ${selectedDevice.deviceIndex} — ${cleanDeviceName(selectedDevice)}`);
  lines.push("");
  lines.push("Wybrane części:");
  if (cart.length) cart.forEach((p, i) => lines.push(`${i + 1}. ${p.partName} | indeks: ${p.partIndex} | poz.: ${p.position || "—"} | ${money(p.priceLabel)}`));
  else lines.push("—");
  lines.push("");
  lines.push("Dane klienta:");
  lines.push(`Imię i nazwisko / firma: ${f.name || "—"}`);
  lines.push(`E-mail: ${f.email || "—"}`);
  lines.push(`Telefon: ${f.phone || "—"}`);
  lines.push(`NIP: ${f.nip || "—"}`);
  lines.push("");
  lines.push("Dane do faktury:");
  lines.push(f.invoice || "—");
  lines.push("");
  lines.push("Adres wysyłki:");
  lines.push(f.shipping || "—");
  lines.push("");
  lines.push("Sposób płatności / dostawy:");
  lines.push(f.payment || "Przedpłata — wysyłka 15 zł brutto");
  lines.push("");
  lines.push("Uwagi:");
  lines.push(f.notes || "—");
  return { subject: `Zapytanie o części — ${selectedDevice?.deviceIndex || "bez modelu"}`, body: lines.join("\n") };
}

function renderMail() {
  const el = $("mailPreview");
  if (el) el.textContent = buildMail().body;
}
function openMail() {
  const m = buildMail();
  window.location.href = `mailto:${SERVICE_MAIL}?subject=${encodeURIComponent(m.subject)}&body=${encodeURIComponent(m.body)}`;
}
function copyMail() {
  navigator.clipboard.writeText(buildMail().body).then(() => toast("Skopiowano treść maila"));
}
function toast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1800);
}

function bind() {
  $("searchBtn")?.addEventListener("click", () => renderResults(search($("q").value)));
  $("q")?.addEventListener("keydown", (e) => { if (e.key === "Enter") renderResults(search($("q").value)); });
  $("suggestBtn")?.addEventListener("click", suggest);
  $("desc")?.addEventListener("keydown", (e) => { if (e.key === "Enter") suggest(); });
  $("clientForm")?.addEventListener("input", renderMail);
  $("openMail")?.addEventListener("click", openMail);
  $("copyMail")?.addEventListener("click", copyMail);
}

document.addEventListener("DOMContentLoaded", async () => {
  bind();
  await loadData();
});

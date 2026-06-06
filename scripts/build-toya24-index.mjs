#!/usr/bin/env node
/**
 * Build TOYA24 attachment index for YATO Service Hub.
 *
 * Input: data/toya24-products-seed.json
 * [ { "deviceIndex":"YT-82200", "productUrl":"https://toya24.pl/pl-PL/products/..." } ]
 *
 * Output: assets/toya24-index.js
 * The script downloads product pages and extracts links from section "Do pobrania",
 * preferring anchors whose text contains "Części zamienne" or the device index.
 */
import fs from 'node:fs/promises';

const seedPath = process.argv[2] || 'data/toya24-products-seed.json';
const outPath = process.argv[3] || 'assets/toya24-index.js';
const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));

const escRe = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const abs = (href) => href?.startsWith('http') ? href : new URL(href, 'https://toya24.pl').href;
const stripTags = html => String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

function findAttachments(html, deviceIndex) {
  const anchors = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map(m => ({href: abs(m[1]), text: stripTags(m[2])}));
  const deviceRx = new RegExp(escRe(deviceIndex).replace('-', '[-\\s]?'), 'i');
  const parts = anchors.find(a => /części\s+zamienne|czesci\s+zamienne|spare/i.test(a.text) && (deviceRx.test(a.text) || /getAttachmentp=/i.test(a.href)))
    || anchors.find(a => /getAttachmentp=/i.test(a.href) && deviceRx.test(a.text))
    || anchors.find(a => /części\s+zamienne|czesci\s+zamienne|spare/i.test(a.text));
  const manual = anchors.find(a => /instrukcja|manual/i.test(a.text) && deviceRx.test(a.text))
    || anchors.find(a => /instrukcja|manual/i.test(a.text));
  return {parts, manual};
}

const entries = [];
for (const item of seed) {
  try {
    const res = await fetch(item.productUrl, {headers: {'user-agent':'YATO-Service-Hub-Indexer/1.0'}});
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const {parts, manual} = findAttachments(html, item.deviceIndex);
    entries.push({
      deviceIndex: item.deviceIndex,
      aliases: item.aliases || [String(item.deviceIndex).replace(/^[A-Z]+-?/, '')],
      brand: item.brand || 'YATO',
      productName: item.productName || '',
      productUrl: item.productUrl,
      partsPdfUrl: parts?.href || '',
      partsTitle: parts?.text || `Części zamienne ${item.deviceIndex}`,
      manualUrl: manual?.href || '',
      manualTitle: manual?.text || '',
      sourceStatus: parts?.href ? 'extracted_from_toya24' : 'product_found_no_parts_attachment'
    });
    console.log(`OK ${item.deviceIndex}: ${parts?.href || 'no parts pdf'}`);
  } catch (err) {
    entries.push({...item, sourceStatus:'fetch_error', error:String(err.message || err)});
    console.warn(`ERR ${item.deviceIndex}: ${err.message || err}`);
  }
}

const payload = {generatedAt: new Date().toISOString(), source:'TOYA24 product pages', entries};
await fs.writeFile(outPath, 'window.PGW_TOYA24_INDEX = '+JSON.stringify(payload, null, 2)+';\n');
console.log(`Saved ${outPath}: ${entries.length} entries`);

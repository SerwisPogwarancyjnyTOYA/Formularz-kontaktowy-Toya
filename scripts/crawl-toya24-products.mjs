#!/usr/bin/env node
/**
 * Crawler TOYA24 — etap 2.
 * Wejście: lista modeli z catalog.generated.json albo CSV z arkusza.
 * Wyjście: data/toya24-products.generated.json + data/toya24-attachments.generated.json.
 * Uwaga: uruchamiać lokalnie / GitHub Action, nie w przeglądarce klienta.
 */
import fs from 'node:fs/promises';
const q = process.argv.slice(2).join(' ') || 'YT-82200';
console.log('TODO crawler TOYA24 dla:', q);
console.log('Szukać: https://toya24.pl/pl-PL/search?text=' + encodeURIComponent(q));

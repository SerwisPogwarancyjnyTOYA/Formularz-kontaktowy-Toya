#!/usr/bin/env node
// v82: master catalog is generated with a hard customer-visible quality gate.
// This wrapper validates the generated v82 output. Rebuild upstream scans using the Apps Script in this package,
// then run `npm run drive-quality-gate` before publishing.
import './pgw-v82-real-drawing-quality-gate.mjs';

// Minimal test runner using Node to execute simple assertions without Jest
// Works on Node 18+ and supports both .test.js (ESM) and .test.mjs files

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testsDir = __dirname;

function listTests() {
  return fs.readdirSync(testsDir).filter(f => f.endsWith('.test.js') || f.endsWith('.test.mjs'));
}

async function run() {
  const files = listTests();
  let failures = 0;
  for (const f of files) {
    const full = path.join(testsDir, f);
    console.log(`\nRunning ${f}...`);
    try {
      await import(url.pathToFileURL(full));
    } catch (err) {
      console.error(`[ERROR] ${f}:`, err);
      failures++;
    }
  }
  if (failures > 0) {
    console.error(`\n${failures} test file(s) failed.`);
    process.exit(1);
  } else {
    console.log(`\nAll tests passed.`);
  }
}

run();

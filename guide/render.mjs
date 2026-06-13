import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
const PROJECT = 'C:/Users/koyam/Documents/Codex/MyShortcuts';
const require = createRequire(path.join(PROJECT, 'package.json'));
const { chromium } = require('playwright');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '..', 'assets');

(async () => {
  const b = await chromium.launch({ args: ['--force-color-profile=srgb'] });
  const p = await b.newPage({ viewport: { width: 1000, height: 700 }, deviceScaleFactor: 2 });
  await p.goto(pathToFileURL(path.join(__dirname, 'mock.html')).href, { waitUntil: 'networkidle' });
  await p.waitForTimeout(300);
  for (let i = 1; i <= 5; i++) {
    await p.locator(`#g${i}`).screenshot({ path: path.join(OUT, `guide-${i}.png`) });
    console.log(`  ✓ guide-${i}.png`);
  }
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });

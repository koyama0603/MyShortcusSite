import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { computeTimeline } from './timeline.mjs';

const PROJECT = 'C:/Users/koyam/Documents/Codex/MyShortcuts';
const require = createRequire(path.join(PROJECT, 'package.json'));
const { chromium } = require('playwright');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const reelUrl = pathToFileURL(path.join(__dirname, 'reel.html')).href;

(async () => {
  const tl = computeTimeline();
  const browser = await chromium.launch({ args: ['--force-color-profile=srgb'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.addInitScript((tl) => { window.__timeline = tl; }, tl);
  await page.goto(reelUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => Promise.all(Array.from(document.images).map((i) => i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))));
  await page.evaluate((tl) => window.__setTimeline && window.__setTimeline(tl), tl);

  // sample mid-points of scenes 0,1,4,7
  const picks = { intro: tl.scenes[0].start + 1.2, overview: tl.scenes[1].start + 2, media: tl.scenes[4].start + 2, outro: tl.scenes[7].start + 1.5 };
  for (const [name, t] of Object.entries(picks)) {
    await page.evaluate((t) => window.__render(t), t);
    await page.screenshot({ path: path.join(__dirname, `_chk-${name}.jpg`), type: 'jpeg', quality: 90 });
  }
  await browser.close();
  console.log('preview frames:', Object.keys(picks).join(', '), '| total', tl.total.toFixed(2) + 's');
})().catch((e) => { console.error(e); process.exit(1); });

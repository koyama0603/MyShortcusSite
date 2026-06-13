/**
 * Records the promo reel into a WebM video using Playwright's bundled encoder.
 * Output: ../../My-Shortcuts-紹介.webm  (i.e. the working folder root)
 */
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const PROJECT = 'C:/Users/koyam/Documents/Codex/MyShortcuts';
const require = createRequire(path.join(PROJECT, 'package.json'));
const { chromium } = require('playwright');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const reelUrl = pathToFileURL(path.join(__dirname, 'reel.html')).href;
const tmpDir = path.join(__dirname, '.rec');
const WORK_ROOT = path.resolve(__dirname, '..', '..'); // c:/Users/koyam/Documents/Claude/test
const finalPath = path.join(WORK_ROOT, 'My-Shortcuts-紹介.webm');

const W = 1280, H = 720;

(async () => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  const browser = await chromium.launch({
    args: ['--autoplay-policy=no-user-gesture-required', '--force-color-profile=srgb'],
  });
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
    recordVideo: { dir: tmpDir, size: { width: W, height: H } },
  });
  const page = await context.newPage();
  await page.goto(reelUrl, { waitUntil: 'networkidle' });
  // make sure screenshots are decoded before the timeline runs
  await page.waitForTimeout(500);
  await page.evaluate(() => Promise.all(
    Array.from(document.images).map((img) =>
      img.complete ? Promise.resolve() : new Promise((r) => { img.onload = img.onerror = r; })),
  ));

  const total = await page.evaluate(() => window.__reelTotal || 31.7);
  const video = page.video();

  await page.waitForTimeout((total + 1.2) * 1000); // let the outro settle
  await page.close();          // finalizes the recording
  await context.close();
  await browser.close();

  const src = await video.path();
  fs.copyFileSync(src, finalPath);
  // also keep a copy beside the source for convenience
  fs.copyFileSync(src, path.join(__dirname, 'My-Shortcuts-promo.webm'));
  fs.rmSync(tmpDir, { recursive: true, force: true });

  const kb = Math.round(fs.statSync(finalPath).size / 1024);
  console.log(`Saved: ${finalPath} (${kb} KB, ~${total.toFixed(1)}s)`);
})().catch((e) => { console.error(e); process.exit(1); });

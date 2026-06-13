/**
 * Renders the reel deterministically to JPEG frames at 1920x1080 / 30fps.
 * Writes timeline.json (from narration durations) and reel/.frames/frame-*.jpg.
 *   node render-frames.mjs
 */
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { writeTimeline, FPS } from './timeline.mjs';

const PROJECT = 'C:/Users/koyam/Documents/Codex/MyShortcuts';
const require = createRequire(path.join(PROJECT, 'package.json'));
const { chromium } = require('playwright');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const reelUrl = pathToFileURL(path.join(__dirname, 'reel.html')).href;
const framesDir = path.join(__dirname, '.frames');

(async () => {
  const tl = writeTimeline();
  const totalFrames = Math.round(tl.total * FPS);
  console.log(`timeline: ${tl.total.toFixed(2)}s, ${tl.scenes.length} scenes, ${totalFrames} frames @ ${FPS}fps`);

  fs.rmSync(framesDir, { recursive: true, force: true });
  fs.mkdirSync(framesDir, { recursive: true });

  const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--hide-scrollbars'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.addInitScript((tl) => { window.__timeline = tl; }, tl);
  await page.goto(reelUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => Promise.all(
    Array.from(document.images).map((img) =>
      img.complete ? Promise.resolve() : new Promise((r) => { img.onload = img.onerror = r; })),
  ));
  await page.evaluate((tl) => window.__setTimeline && window.__setTimeline(tl), tl);

  const t0 = Date.now();
  for (let f = 0; f < totalFrames; f++) {
    const t = f / FPS;
    await page.evaluate((t) => window.__render(t), t);
    await page.screenshot({
      path: path.join(framesDir, `frame-${String(f + 1).padStart(5, '0')}.jpg`),
      type: 'jpeg', quality: 92, clip: { x: 0, y: 0, width: 1920, height: 1080 },
    });
    if (f % 60 === 0) {
      const pct = ((f / totalFrames) * 100).toFixed(0);
      process.stdout.write(`  ${pct}% (${f}/${totalFrames})\r`);
    }
  }
  await browser.close();
  console.log(`\nrendered ${totalFrames} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s → ${framesDir}`);
})().catch((e) => { console.error(e); process.exit(1); });

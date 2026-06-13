/**
 * Re-captures shots/09-desktop2.png at 2x with icons fully loaded.
 * Fix vs. before: show desktop 2 on load (activeDesktop=2), wait longer, and
 * use Google's favicon service so the icons reliably render.
 *   node capture-d2-hires.mjs
 */
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const PROJECT = 'C:/Users/koyam/Documents/Codex/MyShortcuts';
const require = createRequire(path.join(PROJECT, 'package.json'));
const { chromium } = require('playwright');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(PROJECT, 'dist');
const OUT = path.join(__dirname, 'shots');
const now = Date.now();
const favicon = (domain) => `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

const web = (id, name, domain, x, y) => ({
  id, type: 'webShortcut', name, url: `https://${domain}`, iconUrl: favicon(domain),
  parentId: null, desktopId: 2, x, y, appPinned: false, createdAt: now, updatedAt: now,
});

const DB_DATA = {
  version: 1, canvas: { scrollX: 0, scrollY: 0 },
  settings: {
    gridSnap: false, gridSize: 88, language: 'ja', activeDesktop: 2,
    blankDragMode: 'select', themeMode: 'light', windowControlsStyle: 'windows',
    browserZoom: 1, searchEngine: 'google', webShortcutOpenMode: 'newTab',
    calendarPinned: false, minimapVisible: true,
    minimap: { right: 14, bottom: 14, width: 168, height: 120 },
    quickSearchWindow: { left: 360, top: 150 },
    features: {
      localFileShortcuts: { enabled: false, openMode: 'fileUrl' },
      localFolderShortcuts: { enabled: false, openMode: 'fileUrl' },
      preview: { enabled: false, webPreview: false, localFilePreview: false, autoFetchTitle: true },
      pictureInPicture: { alertBeforeClose: false },
    },
  },
  calendarMemos: [],
  items: [
    web('d2a', 'MDN', 'developer.mozilla.org', 28, 24),
    web('d2b', 'Stack Overflow', 'stackoverflow.com', 120, 24),
    web('d2c', 'ChatGPT', 'chatgpt.com', 212, 24),
    web('d2d', 'GitHub', 'github.com', 304, 24),
    web('d2e', 'Qiita', 'qiita.com', 396, 24),
    { id: 'd2n', type: 'stickyNote', name: '付箋', text: '勉強メモ\nReact hooks を復習',
      contentHtml: '<p>勉強メモ<br>React hooks を復習</p>', color: 'green', parentId: null,
      desktopId: 2, x: 28, y: 150, width: 240, height: 158, fontSize: 14, fontColor: '#1f2328',
      bold: false, italic: false, underline: false, pinned: false, minimized: false,
      createdAt: now, updatedAt: now },
    // a desktop-1 item so the "1 / 2 / 3" switcher has real context
    { id: 'f1', type: 'folder', name: 'お気に入り', parentId: null, desktopId: 1, x: 28, y: 24, pinned: false, viewMode: 'icons', listSortDirection: 'asc', createdAt: now, updatedAt: now },
  ],
};

async function inject(page, data) {
  await page.evaluate(async (data) => new Promise((res, rej) => {
    const req = indexedDB.open('edge-desktop-shortcuts', 1);
    req.onupgradeneeded = (e) => { if (!e.target.result.objectStoreNames.contains('workspace')) e.target.result.createObjectStore('workspace'); };
    req.onsuccess = (e) => { const tx = e.target.result.transaction('workspace', 'readwrite'); const p = tx.objectStore('workspace').put(data, 'main'); p.onsuccess = () => res(1); p.onerror = rej; };
    req.onerror = rej;
  }), data);
}

(async () => {
  const userDataDir = path.join(__dirname, '.pw-d2');
  fs.rmSync(userDataDir, { recursive: true, force: true });
  const ctx = await chromium.launchPersistentContext(userDataDir, {
    headless: false, args: [`--load-extension=${DIST}`, `--disable-extensions-except=${DIST}`, '--no-sandbox'],
    viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2, locale: 'ja-JP', timezoneId: 'Asia/Tokyo', ignoreHTTPSErrors: true,
  });
  try {
    let sw = ctx.serviceWorkers()[0] || await ctx.waitForEvent('serviceworker', { timeout: 15000 });
    const extId = sw.url().match(/chrome-extension:\/\/([a-z]{32})\//)[1];
    const p = await ctx.newPage();
    await p.goto(`chrome-extension://${extId}/my.html`, { waitUntil: 'networkidle' });
    await inject(p, DB_DATA);
    await p.reload({ waitUntil: 'networkidle' });
    // wait until every desktop icon <img> has actually loaded (or 8s timeout)
    await p.waitForFunction(() => {
      const imgs = Array.from(document.querySelectorAll('.desktop-item img'));
      return imgs.length >= 5 && imgs.every((i) => i.complete && i.naturalWidth > 0);
    }, { timeout: 8000 }).catch(() => {});
    await p.waitForTimeout(1500);
    await p.screenshot({ path: path.join(OUT, '09-desktop2.png') });
    console.log('  ✓ 09-desktop2 re-captured (icons loaded)');
    await p.close();
  } finally {
    await ctx.close();
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }
})().catch((e) => { console.error(e); process.exit(1); });

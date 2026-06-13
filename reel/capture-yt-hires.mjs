import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
const PROJECT = 'C:/Users/koyam/Documents/Codex/MyShortcuts';
const require = createRequire(path.join(PROJECT, 'package.json'));
const { chromium } = require('playwright');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(PROJECT, 'dist');
const OUT = path.join(__dirname, 'shots');
const now = Date.now();
const DB_DATA = {
  version: 1, canvas: { scrollX: 0, scrollY: 0 },
  settings: { gridSnap: false, gridSize: 88, language: 'ja', activeDesktop: 1, blankDragMode: 'select', themeMode: 'light', windowControlsStyle: 'windows', browserZoom: 1, searchEngine: 'google', webShortcutOpenMode: 'newTab', calendarPinned: false, minimapVisible: true, minimap: { right: 14, bottom: 14, width: 168, height: 120 }, quickSearchWindow: { left: 360, top: 150 }, features: { localFileShortcuts: { enabled: false, openMode: 'fileUrl' }, localFolderShortcuts: { enabled: false, openMode: 'fileUrl' }, preview: { enabled: false, webPreview: false, localFilePreview: false, autoFetchTitle: true }, pictureInPicture: { alertBeforeClose: false } } },
  calendarMemos: [],
  items: [
    { id: 'yt-1', type: 'youtubeShortcut', name: 'お気に入りの動画', url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', videoId: 'aqz-KE-bpKQ', iconUrl: 'https://i.ytimg.com/vi/aqz-KE-bpKQ/hqdefault.jpg', parentId: null, desktopId: 1, x: 28, y: 24, pinned: false, watchedCompleted: false, watchedProgress: 0, playbackPosition: 0, playbackDuration: 0, playbackUpdatedAt: 0, createdAt: now, updatedAt: now },
    { id: 'f-fav', type: 'folder', name: 'お気に入り', parentId: null, desktopId: 1, x: 120, y: 24, pinned: false, viewMode: 'icons', listSortDirection: 'asc', createdAt: now, updatedAt: now },
    { id: 'f-work', type: 'folder', name: '仕事', parentId: null, desktopId: 1, x: 212, y: 24, pinned: false, viewMode: 'list', listSortDirection: 'asc', createdAt: now, updatedAt: now },
    { id: 'w-gh', type: 'webShortcut', name: 'GitHub', url: 'https://github.com', iconUrl: 'https://github.com/favicon.ico', parentId: null, desktopId: 1, x: 304, y: 24, appPinned: false, createdAt: now, updatedAt: now },
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
  const userDataDir = path.join(__dirname, '.pw-yt');
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
    await p.waitForTimeout(2600);
    await p.locator('.desktop-item').filter({ hasText: 'お気に入りの動画' }).first().dblclick();
    await p.waitForTimeout(17000); // let the embed actually play past the spinner
    await p.screenshot({ path: path.join(OUT, '11-youtube.png') });
    console.log('  ✓ 11-youtube hires (17s wait)');
    await p.close();
  } finally {
    await ctx.close();
    require('fs').rmSync(userDataDir, { recursive: true, force: true });
  }
})().catch((e) => { console.error(e); process.exit(1); });

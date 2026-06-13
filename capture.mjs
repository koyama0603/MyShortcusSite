/**
 * Captures feature screenshots for the My Shortcuts intro site by driving the
 * built extension in a headful Chromium window.
 *
 * Run from anywhere:  node "capture.mjs"
 * Playwright is resolved from the project's node_modules via createRequire.
 */
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const PROJECT = 'C:/Users/koyam/Documents/Codex/MyShortcuts';
const require = createRequire(path.join(PROJECT, 'package.json'));
const { chromium } = require('playwright');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(PROJECT, 'dist');
const OUT = path.join(__dirname, 'assets');
const VIEWPORT = { width: 1280, height: 800 };
const now = Date.now();

// A self-contained offline HTML app (analog + digital clock) to showcase HTML apps.
const CLOCK_APP_HTML = `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;height:100%;font-family:system-ui,sans-serif;
    display:grid;place-items:center;background:linear-gradient(135deg,#eef6ff,#f7fbff);color:#2b3a4a}
  .card{text-align:center}
  svg{filter:drop-shadow(0 8px 20px rgba(80,130,200,.18))}
  .t{font-size:34px;font-weight:600;letter-spacing:2px;margin-top:14px}
  .d{font-size:14px;color:#6b7d90;margin-top:4px}
</style></head><body><div class="card">
  <svg id="c" width="220" height="220" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="46" fill="#fff" stroke="#dceaf7" stroke-width="3"/>
    <g id="ticks"></g>
    <line id="h" x1="50" y1="50" x2="50" y2="28" stroke="#3b6fb0" stroke-width="3.2" stroke-linecap="round"/>
    <line id="m" x1="50" y1="50" x2="50" y2="18" stroke="#5b8fd0" stroke-width="2.4" stroke-linecap="round"/>
    <line id="s" x1="50" y1="50" x2="50" y2="14" stroke="#e1899b" stroke-width="1.2" stroke-linecap="round"/>
    <circle cx="50" cy="50" r="2.2" fill="#3b6fb0"/>
  </svg>
  <div class="t" id="txt">--:--:--</div><div class="d">マイ時計アプリ</div>
</div><script>
  const ticks=document.getElementById('ticks');
  for(let i=0;i<12;i++){const a=i*30*Math.PI/180,x1=50+38*Math.sin(a),y1=50-38*Math.cos(a),
    x2=50+43*Math.sin(a),y2=50-43*Math.cos(a);
    ticks.innerHTML+='<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="#c4d8ec" stroke-width="1.4"/>';}
  function tick(){const d=new Date(),h=d.getHours()%12,m=d.getMinutes(),s=d.getSeconds();
    document.getElementById('h').setAttribute('transform','rotate('+((h+m/60)*30)+' 50 50)');
    document.getElementById('m').setAttribute('transform','rotate('+((m+s/60)*6)+' 50 50)');
    document.getElementById('s').setAttribute('transform','rotate('+(s*6)+' 50 50)');
    document.getElementById('txt').textContent=[h||12,m,s].map(n=>String(n).padStart(2,'0')).join(':');}
  tick();setInterval(tick,1000);
</script></body></html>`;

const web = (id, name, url, x, y, desktopId = 1, parentId = null) => ({
  id, type: 'webShortcut', name, url, iconUrl: new URL(url).origin + '/favicon.ico',
  parentId, desktopId, x, y, appPinned: false, createdAt: now - 1e6, updatedAt: now - 1e6,
});
const note = (id, text, html, color, x, y, desktopId = 1, w = 240, h = 158) => ({
  id, type: 'stickyNote', name: '付箋', text, contentHtml: html, color, parentId: null,
  desktopId, x, y, width: w, height: h, fontSize: 14, fontColor: '#1f2328',
  bold: false, italic: false, underline: false, pinned: false, minimized: false,
  createdAt: now - 1e6, updatedAt: now - 1e6,
});

const DB_DATA = {
  version: 1,
  canvas: { scrollX: 0, scrollY: 0 },
  settings: {
    gridSnap: false, gridSize: 88, language: 'ja', activeDesktop: 1,
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
  calendarMemos: [
    { id: 'm1', title: '打ち合わせ', note: '企画レビュー',
      startAt: new Date(new Date().setHours(14, 0, 0, 0)).getTime(),
      endAt: new Date(new Date().setHours(15, 0, 0, 0)).getTime(), createdAt: now, updatedAt: now },
    { id: 'm2', title: '歯医者', note: '駅前クリニック',
      startAt: new Date(new Date().setHours(18, 30, 0, 0)).getTime() + 86400000,
      endAt: new Date(new Date().setHours(19, 0, 0, 0)).getTime() + 86400000, createdAt: now, updatedAt: now },
    { id: 'm3', title: '映画', note: 'レイトショー',
      startAt: new Date(new Date().setHours(20, 0, 0, 0)).getTime() + 3 * 86400000,
      endAt: new Date(new Date().setHours(22, 0, 0, 0)).getTime() + 3 * 86400000, createdAt: now, updatedAt: now },
  ],
  items: [
    // folders
    { id: 'f-fav', type: 'folder', name: 'お気に入り', parentId: null, desktopId: 1, x: 28, y: 24, pinned: false, viewMode: 'icons', listSortDirection: 'asc', createdAt: now, updatedAt: now },
    { id: 'f-work', type: 'folder', name: '仕事', parentId: null, desktopId: 1, x: 120, y: 24, pinned: false, viewMode: 'list', listSortDirection: 'asc', createdAt: now, updatedAt: now },
    // top row web shortcuts
    web('w-yt', 'YouTube', 'https://www.youtube.com', 212, 24),
    web('w-sp', 'Spotify', 'https://open.spotify.com', 304, 24),
    web('w-gh', 'GitHub', 'https://github.com', 396, 24),
    web('w-wiki', 'Wikipedia', 'https://www.wikipedia.org', 488, 24),
    web('w-amz', 'Amazon', 'https://www.amazon.co.jp', 580, 24),
    web('w-maps', 'Maps', 'https://maps.google.com', 672, 24),
    web('w-mail', 'Gmail', 'https://mail.google.com', 764, 24),
    web('w-news', 'ニュース', 'https://news.yahoo.co.jp', 856, 24),
    // youtube shortcut (for in-window playback capture)
    { id: 'yt-1', type: 'youtubeShortcut', name: 'お気に入りの動画', url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', videoId: 'aqz-KE-bpKQ', iconUrl: 'https://i.ytimg.com/vi/aqz-KE-bpKQ/hqdefault.jpg', parentId: null, desktopId: 1, x: 28, y: 132, pinned: false, watchedCompleted: false, watchedProgress: 0, playbackPosition: 0, playbackDuration: 0, playbackUpdatedAt: 0, createdAt: now, updatedAt: now },
    // html app (offline clock)
    { id: 'app-clock', type: 'appShortcut', name: 'マイ時計', html: CLOCK_APP_HTML, parentId: null, desktopId: 1, x: 120, y: 132, pinned: false, createdAt: now, updatedAt: now },
    // sticky notes (lower row so they don't cover the icons above)
    note('n1', '牛乳とパンを買う\nクリーニングを取りに行く', '<p>牛乳とパンを買う<br>クリーニングを取りに行く</p>', 'yellow', 230, 270),
    note('n2', '旅行の予約をする\n・宿\n・新幹線', '<p>旅行の予約をする<br>・宿<br>・新幹線</p>', 'blue', 490, 270),
    note('n3', '読みたい本\n・夜は短し歩けよ乙女', '<p>読みたい本<br>・夜は短し歩けよ乙女</p>', 'pink', 750, 270),
    // inside folders
    web('wf1', 'Slack', 'https://slack.com', 24, 24, 1, 'f-work'),
    web('wf2', 'Notion', 'https://www.notion.so', 116, 24, 1, 'f-work'),
    web('wf3', 'Figma', 'https://www.figma.com', 208, 24, 1, 'f-work'),
    web('wf4', 'Zoom', 'https://zoom.us', 24, 120, 1, 'f-work'),
    web('ff1', 'Netflix', 'https://www.netflix.com', 24, 24, 1, 'f-fav'),
    web('ff2', 'X', 'https://x.com', 116, 24, 1, 'f-fav'),
    web('ff3', 'Instagram', 'https://www.instagram.com', 208, 24, 1, 'f-fav'),
    // desktop 2
    web('d2a', 'MDN', 'https://developer.mozilla.org', 28, 24, 2),
    web('d2b', 'Stack Overflow', 'https://stackoverflow.com', 120, 24, 2),
    web('d2c', 'ChatGPT', 'https://chatgpt.com', 212, 24, 2),
    note('d2n', '勉強メモ\nReact hooks を復習', '<p>勉強メモ<br>React hooks を復習</p>', 'green', 28, 150, 2),
  ],
};

async function getExtensionId(context) {
  let sw = context.serviceWorkers()[0];
  if (!sw) sw = await context.waitForEvent('serviceworker', { timeout: 15000 });
  return sw.url().match(/chrome-extension:\/\/([a-z]{32})\//)[1];
}

async function inject(page, data) {
  await page.evaluate(async (data) => new Promise((resolve, reject) => {
    const req = indexedDB.open('edge-desktop-shortcuts', 1);
    req.onupgradeneeded = (e) => {
      if (!e.target.result.objectStoreNames.contains('workspace'))
        e.target.result.createObjectStore('workspace');
    };
    req.onsuccess = (e) => {
      const tx = e.target.result.transaction('workspace', 'readwrite');
      const put = tx.objectStore('workspace').put(data, 'main');
      put.onsuccess = () => resolve(true);
      put.onerror = reject;
    };
    req.onerror = reject;
  }), data);
}

async function fresh(context, extUrl, data = DB_DATA) {
  const page = await context.newPage();
  await page.goto(extUrl, { waitUntil: 'networkidle' });
  await inject(page, data);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2600);
  return page;
}

const shot = (page, name) => page.screenshot({ path: path.join(OUT, name) });

async function step(label, fn) {
  try { await fn(); console.log('  ✓', label); }
  catch (e) { console.log('  ✗', label, '—', e.message.split('\n')[0]); }
}

(async () => {
  const userDataDir = path.join(__dirname, '.pw-profile');
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [`--load-extension=${DIST}`, `--disable-extensions-except=${DIST}`, '--no-sandbox'],
    viewport: VIEWPORT, locale: 'ja-JP', timezoneId: 'Asia/Tokyo', ignoreHTTPSErrors: true,
  });
  try {
    const extId = await getExtensionId(context);
    const extUrl = `chrome-extension://${extId}/my.html`;
    console.log('Extension:', extId);

    await step('01-overview', async () => {
      const p = await fresh(context, extUrl);
      await shot(p, '01-overview.png'); await p.close();
    });

    await step('02-create-menu', async () => {
      const p = await fresh(context, extUrl);
      await p.click('.toolbar-create-menu button');
      await p.waitForTimeout(400);
      await shot(p, '02-create-menu.png'); await p.close();
    });

    await step('03-folder', async () => {
      const p = await fresh(context, extUrl);
      await p.locator('.desktop-item').filter({ hasText: '仕事' }).first().dblclick();
      await p.waitForTimeout(900);
      await shot(p, '03-folder.png'); await p.close();
    });

    await step('04-calendar', async () => {
      const p = await fresh(context, extUrl);
      await p.click('.toolbar-clock-area button');
      await p.waitForTimeout(800);
      await shot(p, '04-calendar.png'); await p.close();
    });

    await step('05-search', async () => {
      const p = await fresh(context, extUrl);
      await p.fill('.toolbar-search input', 'note');
      await p.fill('.toolbar-search input', '旅行');
      await p.waitForTimeout(700);
      await shot(p, '05-search.png'); await p.close();
    });

    await step('06-context-menu', async () => {
      const p = await fresh(context, extUrl);
      await p.locator('.desktop-item').filter({ hasText: 'GitHub' }).first().click({ button: 'right' });
      await p.waitForTimeout(600);
      await shot(p, '06-context-menu.png'); await p.close();
    });

    await step('07-settings', async () => {
      const p = await fresh(context, extUrl);
      await p.click('.toolbar-settings-button');
      await p.waitForTimeout(700);
      await shot(p, '07-settings.png'); await p.close();
    });

    await step('08-quicksearch', async () => {
      const p = await fresh(context, extUrl);
      await p.click('.quick-web-search-button');
      await p.waitForTimeout(700);
      await shot(p, '08-quicksearch.png'); await p.close();
    });

    await step('09-desktop2', async () => {
      const p = await fresh(context, extUrl);
      await p.click('.desktop-switch-button >> text=2');
      await p.waitForTimeout(900);
      await shot(p, '09-desktop2.png'); await p.close();
    });

    await step('10-htmlapp', async () => {
      const p = await fresh(context, extUrl);
      await p.locator('.desktop-item').filter({ hasText: 'マイ時計' }).first().dblclick();
      await p.waitForTimeout(1600);
      await shot(p, '10-htmlapp.png'); await p.close();
    });

    await step('11-youtube', async () => {
      const p = await fresh(context, extUrl);
      await p.locator('.desktop-item').filter({ hasText: 'お気に入りの動画' }).first().dblclick();
      await p.waitForTimeout(5000); // let the embed load
      await shot(p, '11-youtube.png'); await p.close();
    });

    await step('12-dark', async () => {
      const dark = { ...DB_DATA, settings: { ...DB_DATA.settings, themeMode: 'dark' } };
      const p = await fresh(context, extUrl, dark);
      await shot(p, '12-dark.png'); await p.close();
    });

    console.log('\nDone →', OUT);
  } finally {
    await context.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });

// Site language switcher. Keeps the Japanese markup as the source and swaps copy in-place.
(() => {
  const STORAGE_KEY = 'myShortcuts:site-language';
  const SUPPORTED = new Set(['ja', 'en']);
  const originalDocumentTitle = document.title;
  const pageName = () => {
    const file = decodeURIComponent(window.location.pathname.split('/').pop() || '');
    return file || 'index.html';
  };

  const pageMeta = {
    'index.html': {
      title: 'My Shortcuts - Your own desktop, right in your browser.',
      description: 'Put your favorite sites, videos, notes, and mini-apps on one screen and open what you need with one click. My Shortcuts is a free extension for Microsoft Edge and Chrome.',
    },
    'arrange.html': {
      title: 'Arrange Freely - My Shortcuts',
      description: 'Place icons and notes anywhere with drag and drop, move selected items together, snap neatly to a grid, and use the minimap to see a large workspace.',
    },
    'add-shortcuts.html': {
      title: 'Adding Shortcuts - My Shortcuts',
      description: 'Add shortcuts from open tabs, context menus, bookmarks, dragged links, YouTube, Spotify, or an imported bookmarks HTML file.',
    },
    'organize.html': {
      title: 'Stay Organized - My Shortcuts',
      description: 'Group related shortcuts into folders, switch between icon and list views, and even place folders inside folders.',
    },
    'media.html': {
      title: 'Enjoy Media In Place - My Shortcuts',
      description: 'Play videos and music in small windows without leaving your workspace, resume where you left off, and use Picture-in-Picture.',
    },
    'apps.html': {
      title: 'Your Own Apps - My Shortcuts',
      description: 'Turn small HTML apps into desktop icons, open them in separate windows, and export them to carry to another PC.',
    },
    'desktops.html': {
      title: 'Switch Desktops - My Shortcuts',
      description: 'Use three separate desktops for work, hobbies, and study, then switch between them with one tap.',
    },
    'search-calendar.html': {
      title: 'Search and Calendar - My Shortcuts',
      description: 'Filter items from the top search box, search the web from the desktop, and manage calendar items from local files.',
    },
    'menus-windows.html': {
      title: 'Context Menus and Windows - My Shortcuts',
      description: 'Learn what each context menu can do and how to use window controls such as minimize, maximize, close, and pin.',
    },
    'settings-guide.html': {
      title: 'Settings Guide - My Shortcuts',
      description: 'A guide to language, search engine, shortcut behavior, window controls, Picture-in-Picture, bookmark import, and backup settings.',
    },
    'privacy-policy.html': {
      title: 'Privacy Policy - My Shortcuts',
      description: 'Privacy Policy for My Shortcuts. Data is stored locally in your browser and is not sent to developer servers.',
    },
  };

  const en = {
    '動画': 'Video',
    '配置': 'Arrange',
    'ショートカット': 'Shortcuts',
    '整理': 'Organize',
    'メディア': 'Media',
    'アプリ': 'Apps',
    '切り替え': 'Switch',
    '検索': 'Search',
    '始め方': 'Get Started',
    'はじめる': 'Start',
    '機能紹介': 'Features',
    '追加方法': 'Add',
    '設定': 'Settings',
    'メニュー操作': 'Menus',
    '検索・カレンダー': 'Search & Calendar',
    'プライバシーポリシー': 'Privacy Policy',
    'もどる': 'Back',
    'ガイド': 'Guide',

    'Microsoft Edge / Chrome 拡張機能': 'Microsoft Edge / Chrome Extension',
    'ブラウザに、': 'Your own desktop,',
    '自分だけのデスクトップを。': 'right in your browser.',
    'よく使うサイトも、動画も、ちょっとしたメモも。 ぜんぶをひとつの画面に並べて、見たいものへワンクリックで。': 'Keep favorite sites, videos, and quick notes together on one screen, then open what you need with one click.',
    '無料で使ってみる': 'Try it for free',
    'できることを見る': 'See what it can do',
    'データはすべて手元のブラウザの中。アカウント登録もいりません。': 'All data stays in your browser. No account required.',
    '動画で見る': 'Watch the video',
    'ナレーション音声: VOICEVOX：もち子さん': 'Narration voice: VOICEVOX Mochiko-san',
    '自由に置く': 'Arrange Freely',
    '好きな場所に、好きなだけ。': 'Put anything anywhere.',
    'アイコンはドラッグするだけで、どこにでも。 使う順に並べたり、グループにまとめたり。 きれいに揃えたいときは、そっとマス目に吸い付きます。': 'Drag icons wherever you like. Arrange them by how you use them, group related things, or let them gently snap to the grid.',
    'ドラッグして自由に配置': 'Drag to place items freely',
    'まとめて選んで一括で移動': 'Select multiple items and move them together',
    '広い画面を見渡せるミニマップ付き': 'Use the minimap to see the whole workspace',
    '自由な置き方': 'Free arrangement',
    'なんでも置ける': 'Put Almost Anything There',
    'サイトも、メモも、アプリも。': 'Sites, notes, and apps.',
    'Web サイト、付箋、自作の小さなアプリ。 作りたいものを選んで置くだけ。 いま見ているページは、右クリックからそのまま送れます。': 'Add websites, sticky notes, and small apps you make yourself. Choose what to create, or send the page you are viewing from the right-click menu.',
    'Webショートカット — お気に入りのサイトを一発で': 'Web shortcuts - open favorite sites instantly',
    '付箋 — 思いついたことをその場にメモ': 'Sticky notes - capture ideas right where they happen',
    'HTML アプリ — 自分で作った小さなツールも置ける': 'HTML apps - place your own small tools on the desktop',
    'いろいろな追加方法': 'Ways to add shortcuts',
    'すっきり整理': 'Stay Organized',
    '増えてきたら、フォルダへ。': 'When things grow, use folders.',
    '関係のあるものはフォルダにまとめて、必要なときだけ開く。 アイコン表示でも、一覧表示でも。 フォルダの中にフォルダも作れます。': 'Group related items into folders and open them only when needed. Use icon view, list view, or even folders inside folders.',
    'ドラッグで入れるだけ': 'Just drag items into folders',
    'アイコン / リストの切り替え': 'Switch between icon and list views',
    'ウィンドウは移動・サイズ変更が自由自在': 'Move and resize windows freely',
    'フォルダで整理': 'Organize with folders',
    'そのまま楽しむ': 'Enjoy Media In Place',
    '動画も音楽も、画面を離れずに。': 'Videos and music, without leaving the screen.',
    'YouTube や Spotify のショートカットは、その場の小さなウィンドウで再生。タブを切り替えなくても、作業のとなりで流せます。続きはちゃんと覚えているので、また同じところから。': 'YouTube and Spotify shortcuts play in small windows right on the desktop, so you can keep them beside your work. Playback positions are remembered too.',
    '続きから再生': 'Resume playback',
    'どこまで見たかを覚えているので、開けばその続きから。': 'It remembers where you stopped, so you can continue from there.',
    'ピクチャー イン ピクチャー': 'Picture-in-Picture',
    '画面ごと小さなウィンドウに切り出して、いつも手前に。ほかの作業をしながらでも。': 'Pop the screen into a small always-on-top window while you work elsewhere.',
    '並べて表示': 'Arrange side by side',
    'いくつも開いて、好きな大きさで横に。自分だけの作業台に。': 'Open several windows and size them however you like on your own workbench.',
    '動画・音楽の楽しみ方': 'Video and music',
    '自分のアプリ': 'Your Own Apps',
    'つくったものを、置いておける。': 'Keep what you build close at hand.',
    '時計、電卓、ちょっとしたゲーム。 HTML で書いた小さなアプリを、そのままデスクトップのアイコンに。 ダブルクリックで、すぐ動きます。': 'Clocks, calculators, tiny games: turn small HTML apps into desktop icons and launch them with a double-click.',
    'HTML ファイルを読み込むだけ': 'Import an HTML file',
    '独立した画面で安全に動く': 'Runs safely in an isolated window',
    '書き出して持ち運びもできる': 'Export and carry it with you',
    '自作アプリのこと': 'Custom apps',
    '切り替える': 'Switch Desktops',
    '3つの画面を、用途で使い分け。': 'Three desktops for different uses.',
    '仕事用、趣味用、学習用。 画面をまるごと切り替えて、いまやることだけに集中。 混ざらないから、頭の中もすっきり。': 'Use one desktop for work, one for hobbies, and one for study. Switch the whole screen and focus on what matters now.',
    'ワンタップで 1 / 2 / 3 を切り替え': 'Switch 1 / 2 / 3 with one tap',
    'それぞれが独立した作業スペース': 'Each one is an independent workspace',
    '画面の使い分け': 'Using multiple desktops',
    '予定も一緒に': 'Calendar Included',
    'カレンダーは、すぐそこに。': 'Your calendar is right there.',
    '上のバーから、今日の予定をさっと確認。 ちょっとした予定はその場で書き込めます。 手元のカレンダーファイルから読み込むこともできます。': 'Check today from the top bar, add quick events, or import calendar files from your computer.',
    'クリックひとつで開く': 'Open it with one click',
    '予定をその場でメモ': 'Add events on the spot',
    'カレンダーファイルの取り込みにも対応': 'Import calendar files too',
    'カレンダーの使い方': 'Calendar guide',
    'すぐ見つかる': 'Find It Fast',
    '探す手間を、なくす。': 'Stop hunting for things.',
    '名前を打てば、目当てのアイコンだけがすっと残ります。 Web をそのまま調べたいときは、検索ウィンドウから。 いつもの検索エンジンを選んでおけます。': 'Type a name and only matching icons remain. Search the web from the search window using your favorite engine.',
    '置いたものを名前でしぼり込み': 'Filter placed items by name',
    'そのまま Web 検索へ': 'Search the web right away',
    'Google や Bing など好みのエンジンを選べる': 'Choose Google, Bing, or another engine',
    '検索の使い方': 'Search guide',
    '細部まで、心地よく。': 'Comfort in the details.',
    '毎日のことだから、小さな使い心地まで。': 'Because you use it every day, the small touches matter.',
    '右クリックで、ぱっと操作': 'Quick actions by right-click',
    '開く・名前を変える・複製・別の画面へ送る。よく使う操作はその場で。': 'Open, rename, duplicate, or send items to another desktop right where you are.',
    'ライトとダーク': 'Light and dark',
    '時間帯や気分に合わせて、目にやさしい見た目へ。': 'Choose an easier look for the time of day or your mood.',
    'まるごとバックアップ': 'Full backup',
    '並べたものは1つのファイルに書き出し。別のPCへもそのまま。多言語にも対応。': 'Export everything to one file, move it to another PC, and use multiple languages.',
    '右クリックとウィンドウ操作': 'Context menus and windows',
    '設定でできること': 'Settings guide',
    'あなたのものは、あなたの手元に。': 'Your things stay with you.',
    '並べたサイトもメモも、保存先はこのブラウザの中だけ。 どこかに送られることはありません。アカウントもログインも不要です。': 'Your sites and notes are saved only in this browser. They are not sent anywhere, and no account or login is required.',
    '今日から、ブラウザがもっと自分らしく。': 'Make your browser feel more like yours today.',
    'Microsoft Edge と Chrome に対応。無料で使えます。': 'Works with Microsoft Edge and Chrome. Free to use.',
    'Edgeアドオンストア': 'Edge Add-ons Store',
    'Chromeウェブストア': 'Chrome Web Store',
    'アイコンを押すだけで、いつでもあなたのデスクトップが開きます。': 'Press the icon whenever you want to open your desktop.',
    'インストールから、毎日開くまで。': 'From installation to daily access.',
    'かんたんな手順で、すぐに使い始められます。': 'A few simple steps are all it takes.',
    '拡張機能をインストール': 'Install the extension',
    'で拡張機能をインストール。': ' to install the extension.',
    'ブラウザの設定画面、拡張機能の設定でMy Shortcutsの機能をONにします。': 'Then enable My Shortcuts in your browser extension settings.',
    'ツールバーにピン留め': 'Pin it to the toolbar',
    'パズルのアイコンを開き、My Shortcuts のピンを押すと、アイコンが常に表示されてワンクリックで開けます。': 'Open the puzzle icon and pin My Shortcuts so the icon stays visible for one-click access.',
    'アプリを開く': 'Open the app',
    'ツールバーの My Shortcuts アイコンをクリックすると、あなたのデスクトップが新しいタブで開きます。': 'Click the My Shortcuts icon in the toolbar to open your desktop in a new tab.',
    'お気に入りに登録': 'Add it to favorites',
    'アプリを開いた状態でアドレスバーの☆（または': 'With the app open, press the star in the address bar (or ',
    '）を押すと、お気に入りからも開けます。': ') to open it from favorites too.',
    '起動時に自動で開く': 'Open automatically on startup',
    '設定の「起動時」で「特定のページを開く」に拡張機能ページを追加すると、ブラウザを開くたびに最初に表示されます。': 'In browser startup settings, add the extension page under "Open a specific page" to show it first whenever the browser opens.',
    'ブラウザに、自分だけのデスクトップを。': 'Your own desktop, right in your browser.',

    'アイコンも付箋も、つかんで動かすだけ。自分の使いやすいように、画面を組み立てられます。': 'Move icons and notes just by dragging them. Build the screen around the way you work.',
    'ドラッグで配置': 'Place by dragging',
    'つかんで、置くだけ。': 'Grab it and drop it.',
    '並べる場所に決まりはありません。よく使う順に並べたり、近いものを寄せたり。きれいに揃えたいときは、そっとマス目に吸い付きます。': 'There are no fixed slots. Put frequent items first, keep related items close, or let them snap neatly to the grid.',
    'マス目にすっと整列（グリッド吸着）': 'Snap neatly to the grid',
    'はみ出すほど広い作業スペース': 'A workspace larger than the screen',
    'まとめて動かす': 'Move items together',
    'いくつもまとめて、いっぺんに。': 'Select many items at once.',
    '何もない所からドラッグすると、四角い範囲でまとめて選択。そのまま動かせば、グループごとすっと移動できます。模様替えも一気に。': 'Drag from an empty area to select a rectangle of items, then move the whole group at once.',
    'ドラッグで範囲を選択': 'Drag to select an area',
    '選んだものを一括で移動': 'Move selected items together',
    '名前を変える・削除もまとめて': 'Rename or delete in batches',
    '見渡す': 'See the whole space',
    '広くても、迷子にならない。': 'Never get lost in a big workspace.',
    '画面いっぱいに広げても、右下のミニマップで全体をひと目で。見たいあたりをクリックすれば、すっとそこへ移動します。': 'Even on a large canvas, the minimap shows everything at a glance. Click where you want to go.',
    '全体を小さく表示するミニマップ': 'A minimap for the whole workspace',
    'クリックで見たい場所へジャンプ': 'Click to jump where you want',
    '表示倍率も自由に変えられる': 'Freely change the zoom level',
    '並べ方は、あなたしだい。': 'Arrange it your way.',
    'どんなふうに並べても、その配置はこのブラウザの中に保存されます。次に開いても、そのまま。': 'However you arrange things, the layout is saved in this browser and stays there next time.',

    'ショートカットの追加': 'Adding Shortcuts',
    '追加のしかたは、いろいろ。': 'There are many ways to add things.',
    '使う場面に合わせて、いちばんラクな方法で。気づいたものを、その場でサッと。': 'Use whichever method is easiest in the moment and capture things as you find them.',
    '開いているタブから追加': 'Add from open tabs',
    'デスクトップの何もない所を右クリックし、「開いているタブから追加」へ。いま開いているタブの一覧から選ぶだけで置けます。': 'Right-click an empty area of the desktop and choose "Add from open tabs." Pick from the list of current tabs to place it.',
    'ブラウザの右クリックから送る': 'Send from the browser context menu',
    '見ているページやリンクを右クリック →「My Shortcuts」→「デスクトップ N に送る」。アプリを開いていなくても追加できます。': 'Right-click a page or link, then choose "My Shortcuts" and "Send to Desktop N." You can add it without opening the app.',
    'お気に入りバーからドラッグ': 'Drag from the bookmarks bar',
    'ブラウザのお気に入りバーにあるブックマークを、そのままデスクトップへドラッグ＆ドロップ。': 'Drag a bookmark from your browser bookmarks bar straight onto the desktop.',
    'サイドバー・分割表示でドラッグ': 'Drag from sidebar or split view',
    'サイドバー表示や分割表示のときは、もう一方の画面で見ているリンクを直接ドラッグして追加できます。': 'When using sidebar or split view, drag a link directly from the other pane to add it.',
    'YouTube の動画を送る': 'Send a YouTube video',
    'YouTube の再生画面を右クリックすると「My Shortcuts に送る」が表示されます。動画はアプリ内のプレーヤーで、続きから再生できます。': 'Right-click a YouTube watch page and choose "Send to My Shortcuts." Videos play in the app and can resume where you left off.',
    'Spotify の曲を送る': 'Send Spotify music',
    'Spotify で曲・アルバム・プレイリストを右クリック →「My Shortcuts に送る」。アプリ内のプレーヤーで再生できます。': 'Right-click a Spotify track, album, or playlist and send it to My Shortcuts. It plays in the app window.',
    'お気に入りをまとめてインポート': 'Import bookmarks in bulk',
    '設定の「ブラウザお気に入り(HTML)のインポート」で、これまでのブックマークを一括で取り込めます。': 'Use "Import browser bookmarks (HTML)" in settings to bring in your bookmarks at once.',
    'どの方法でも、置いたものは手元のブラウザの中。': 'Whichever method you use, added items stay in your browser.',
    '追加したショートカットは、ドラッグで好きな場所へ。フォルダにまとめたり、別の画面へ送ったり、自由に整理できます。': 'Move added shortcuts anywhere, group them in folders, send them to another desktop, and organize freely.',

    '関係のあるものはひとつにまとめて、必要なときだけ開く。画面はいつもすっきり。': 'Group related items together and open them only when needed, so the screen stays clean.',
    'まとめる': 'Group items',
    'ドラッグで、入れるだけ。': 'Just drag items in.',
    'アイコンをフォルダに重ねれば、その中へ。開くと移動もサイズ変更もできるウィンドウになり、机の上に小さな引き出しを置く感覚で使えます。': 'Drop an icon onto a folder to put it inside. Open it as a movable, resizable window, like a small drawer on your desk.',
    'ウィンドウは移動・サイズ変更が自由': 'Move and resize windows freely',
    'フォルダの中に、さらにフォルダも': 'Create folders inside folders',
    '見やすく': 'Easy to view',
    '中身は、好きな見え方で。': 'View contents your way.',
    'アイコンでも、一覧でも。上のボタンでいつでも切り替えられます。': 'Use icons or a list. Switch anytime with the buttons at the top.',
    'アイコン表示': 'Icon view',
    '中のものを、デスクトップと同じようにアイコンで。フォルダの中にフォルダを作って、さらに細かく分けることもできます。': 'See folder contents as icons, just like the desktop. You can create folders inside for finer organization.',
    'リスト表示': 'List view',
    '数が多いときは一覧で。名前やリンク先がそろって見やすく、名前順の並べ替えもできます。': 'Use a list when there are many items. Names and links line up neatly, and you can sort by name.',
    '整え方は、自由自在。': 'Organize it however you like.',
    'フォルダの分け方も、表示の仕方も、あなたの使いやすいように。設定はこのブラウザの中に覚えておきます。': 'Folder structure and view style are up to you, and the settings are remembered in this browser.',

    'タブを切り替えなくても、作業のとなりで流しておける。見たいときに、その場で。': 'Keep media playing beside your work without switching tabs.',
    'その場で再生': 'Play in place',
    '小さなウィンドウで、すぐに。': 'Open it in a small window.',
    '動画も音楽も、デスクトップの上に開く小さなウィンドウで再生できます。': 'Videos and music can play in small windows on the desktop.',
    '動画を、その場で': 'Video, right where you are',
    'YouTube の動画は、その場の小さなウィンドウで再生。大きさも置き場所も自由なので、調べものをしながらでも気になりません。': 'YouTube videos play in small windows. Resize and place them freely while you research or work.',
    '音楽も、となりで': 'Music beside your work',
    'Spotify の曲やアルバム、プレイリストも同じように。作業用の BGM を流しっぱなしにして、手を止めずに。': 'Spotify tracks, albums, and playlists work the same way, so background music can keep playing while you work.',
    '続きから、再生': 'Resume where you left off',
    'どこまで見たかを覚えているので、開けばその続きから。アイコンには進み具合も表示されます。': 'It remembers progress and shows it on the icon, so you can continue from the same point.',
    'アイコンに「どこまで見たか」を表示。': 'The icon shows how far you watched.',
    '手前に置く': 'Keep it in front',
    'ほかの作業をしながらでも。': 'Even while doing other work.',
    'ピクチャー イン ピクチャーなら、画面ごと小さなウィンドウに切り出して、いつも手前に。ほかのタブやアプリを使っていても、視界のすみで流しておけます。いくつも開いて、好きな大きさで横に並べることも。': 'With Picture-in-Picture, pop the screen into a small always-on-top window. Keep it in sight while using other tabs or apps, or line up multiple windows.',
    '画面を小さなウィンドウに切り出して常に手前へ': 'Pop the screen into an always-on-top window',
    'いくつも並べて、自分だけの作業台に': 'Line up multiple windows on your own workbench',
    'うっかり閉じる前にひと声（設定でオン）': 'Warn before accidental closing (optional)',
    '上部のボタンから、ぱっと切り出し。': 'Pop it out from the top button.',
    '見たもの・聴いたものも、手元に。': 'What you watch and hear stays close.',
    'どこまで再生したかも、このブラウザの中に。アカウントの連携やログインは必要ありません。': 'Playback progress is stored in this browser. No account connection or login is required.',

    '時計、電卓、ちょっとしたツール。HTML で書いた小さなアプリを、デスクトップのアイコンに。': 'Clocks, calculators, small tools: turn HTML mini-apps into desktop icons.',
    '置いておく': 'Keep them there',
    'アイコンにして、いつでも。': 'Make them icons, ready anytime.',
    'HTML ファイルを読み込むか、その場で書くだけ。あとはダブルクリックで、独立したウィンドウですぐに動きます。よく使うものはピン留めしておけば、開くたびに自動で表示。': 'Import an HTML file or write one on the spot. Double-click to run it in its own window. Pin frequently used apps so they open automatically.',
    '独立したウィンドウで安全に動く': 'Runs safely in an isolated window',
    '書き出して、持ち運びもできる': 'Export it and take it with you',
    'たとえば': 'For example',
    'こんなものも、動きます。': 'These can run too.',
    'アイデアしだいで、自分だけの小さな道具を。': 'Turn your ideas into small personal tools.',
    '時計': 'Clock',
    'いまの時刻と日付をいつも表示。動きのあるものも、ちゃんと動きます。デスクの上に置いておくだけで便利。': 'Keep the current time and date visible. Animated apps work too, and they are handy sitting on your desk.',
    '電卓': 'Calculator',
    'ボタンの並ぶ電卓のような道具も。ちょっとした計算に、わざわざ別のアプリを開かなくても。': 'A button-based calculator works too, so quick calculations do not require another app.',
    'あなたのアプリは、あなたのもの。': 'Your apps are yours.',
    '作ったアプリも、その中のデータも、このブラウザの中だけ。1 つのファイルに書き出して、別の PC へ持っていくこともできます。': 'Your apps and their data stay in this browser. Export one file and bring it to another PC.',

    '仕事用、趣味用、学習用。画面をまるごと切り替えて、いまやることだけに集中。': 'Use separate screens for work, hobbies, and study, then switch the whole desktop to focus on now.',
    'ワンタップ': 'One tap',
    '1 / 2 / 3 で、ぱっと切り替え。': 'Switch instantly with 1 / 2 / 3.',
    '上部の番号を押すだけで、画面ごと入れ替わります。それぞれが独立した作業スペースなので、内容が混ざることはありません。頭の中まで、すっきり。': 'Press a number at the top to change the whole screen. Each workspace is independent, so things do not mix.',
    '1 / 2 / 3 をワンタップで切り替え': 'Switch 1 / 2 / 3 with one tap',
    'それぞれが独立したスペース': 'Each one is independent',
    '用途ごとに分けて、集中できる': 'Separate tasks and stay focused',
    '上部の 1 / 2 / 3 ボタン。': 'The 1 / 2 / 3 buttons at the top.',
    'たとえば、こんなふうに': 'For example',
    '3つの顔を、ひとつのブラウザに。': 'Three faces in one browser.',
    '同じ並べ方でも、画面ごとにまったく別の作業台になります。': 'Each desktop becomes a completely different workbench.',
    '画面 1 ・ 仕事': 'Desktop 1 - Work',
    'メールやチャット、開発ツールと、今日のやることを。': 'Mail, chat, development tools, and today\'s tasks.',
    '画面 2 ・ 趣味': 'Desktop 2 - Hobbies',
    '動画や音楽、ゲーム。息抜きのものは、こちらにまとめて。': 'Videos, music, and games for breaks.',
    '画面 3 ・ 学習': 'Desktop 3 - Study',
    '調べもの、語学、オンライン講座。学ぶときの道具を。': 'Research, languages, online courses, and study tools.',
    '3つの画面も、ぜんぶ手元に。': 'All three desktops stay with you.',
    'どの画面に何を置いたかも、このブラウザの中に保存されます。次に開いても、そのまま。': 'What you place on each desktop is saved in this browser and stays there next time.',

    '検索とカレンダー': 'Search and Calendar',
    '探すのも、予定も、画面の上から。': 'Search and schedule from the top of the screen.',
    '置いたものをすぐ見つけて、Web もそのまま調べる。予定も、いつも見える所に。': 'Find placed items quickly, search the web in place, and keep your schedule nearby.',
    '見つける。そのまま、調べる。': 'Find things, then search right away.',
    '画面いちばん上のバーから、2 とおりの探しかた。': 'Two ways to search from the top bar.',
    'アプリ内の検索': 'Search inside the app',
    '上部の検索ボックスに打つと、名前の合うものだけがすっと残ります。たくさん並んでいても、目当てのアイコンへ一直線。': 'Type in the top search box and only matching items remain, even on a busy desktop.',
    '入力を消すか、× を押せば、もとの並びに戻ります。': 'Clear the text or press x to restore the original layout.',
    'Web 検索': 'Web search',
    '調べたいことは、わざわざタブを開かなくても大丈夫。上部のボタンを押すか、デスクトップの何もない所をダブルクリックすると、検索ウィンドウがその場に開きます。': 'Search without opening a new tab. Press the top button or double-click an empty desktop area to open the search window.',
    '上部の Web 検索ボタン。': 'The Web Search button at the top.',
    'デスクトップのダブルクリックでも、同じウィンドウが開きます。': 'Double-clicking the desktop opens the same window.',
    'カレンダー': 'Calendar',
    '予定は、すぐそこに。': 'Your schedule is right there.',
    '上部の日付から開いて、その場で書き込み。手元のファイルから取り込むこともできます。': 'Open it from the date at the top, add events in place, or import files from your computer.',
    'カレンダーを開く': 'Open the calendar',
    '画面右上の日付を押すと、その月のカレンダーが開きます。予定のある日には、件数とタイトルがちらりと表示。今日の場所もひと目でわかります。': 'Press the date in the top right to open the month. Days with events show a count and title, and today is easy to spot.',
    '画面右上の日付を押すだけ。': 'Just press the date in the top right.',
    '予定を記入する': 'Add an event',
    '日付を選んで「新規」。タイトルとメモ、開始・終了の日時を入れて保存するだけ。その日に入っている予定も、ここで一覧できます。': 'Select a date, choose New, enter a title, notes, start and end times, and save. You can also view that day\'s events here.',
    'ファイルから取り込む': 'Import from files',
    'もらった予定ファイルは、デスクトップにドロップするだけ。': 'Drop received event files onto the desktop.',
    '（iCalendar）や': ' (iCalendar) or ',
    '（Outlook）の予定を、まとめてカレンダーに取り込めます。同じ予定は重ねて入りません。': ' (Outlook) events can be imported together without duplicates.',
    '調べたことも、予定も、手元に。': 'Searches and schedules stay with you.',
    '検索の言葉も、書き込んだ予定も、このブラウザの中に。どこかへ送られることはありません。': 'Search words and events you enter stay in this browser and are not sent anywhere.',

    '右クリックとウィンドウ': 'Context Menus and Windows',
    '右クリックで、ぐっと近道。': 'Right-click for shortcuts.',
    'アイコンや画面の上で右クリック。そのとき欲しい操作だけが、すっと出てきます。': 'Right-click an icon or the screen to get the actions that make sense there.',
    '右クリックメニュー': 'Context menus',
    '何の上で押すかで、中身が変わる。': 'The menu changes based on what you click.',
    '場面ごとに、そこで使える特徴的なものだけをまとめました。': 'Here are the key actions available in each context.',
    '※ コピー・切り取り・削除など、見ればわかる操作は省いています。': 'Common actions such as copy, cut, and delete are omitted here.',
    '何もない所（デスクトップ）': 'Empty area (desktop)',
    '画面の空いている所で右クリック。新しく置くものは、だいたいここから始まります。': 'Right-click an empty area to start adding new things.',
    'クイックWeb検索': 'Quick web search',
    '新規アプリ': 'New app',
    '新規付箋': 'New sticky note',
    '新規フォルダ': 'New folder',
    '新規Webショートカット': 'New web shortcut',
    '「開いているタブから追加」を選ぶと、いま開いているタブが一覧で出てきて、選ぶだけで並べられます。': 'Choose "Add from open tabs" to see current tabs and place one by selecting it.',
    'アプリのアイコン': 'App icon',
    '自分でつくった小さなアプリの上で。中身に手を入れたり、持ち運んだり。': 'For small apps you made, edit the content or export them.',
    'アプリ編集': 'Edit app',
    'HTMLとしてエクスポート': 'Export as HTML',
    '「アプリ編集」で中身を書き直し。「HTMLとしてエクスポート」で、1つのファイルとして書き出して持ち出せます。': 'Use "Edit app" to change it, or "Export as HTML" to save it as one file.',
    'Webショートカットのアイコン': 'Web shortcut icon',
    'お気に入りサイトのアイコンの上で。開き方を、その場で選べます。': 'Choose how a favorite site opens right from its icon.',
    'デスクトップで開く': 'Open on desktop',
    'タブで開く': 'Open in tab',
    '別ウィンドウで開く': 'Open in new window',
    'URLをコピー': 'Copy URL',
    '「デスクトップで開く」は、画面を離れずにアプリ内の小さなウィンドウで。リンクのコピーも、ここからすぐに。': '"Open on desktop" opens it in a small in-app window, and you can copy the link here too.',
    'フォルダのアイコン': 'Folder icon',
    'まとめたフォルダの上で。': 'For a grouped folder.',
    '開く（ウィンドウで開く）': 'Open (as a window)',
    '開くと、移動もサイズ変更もできるウィンドウに。アイコン表示か一覧表示かは、次に開いたときもちゃんと覚えています。中へドラッグして、あとから入れることもできます。': 'Opening a folder shows a movable, resizable window. Its icon or list view is remembered, and you can drag more items into it later.',
    'ウィンドウの上のボタン': 'Window controls',
    '開いた画面は、思いのまま。': 'Control opened windows freely.',
    'フォルダや動画、アプリのウィンドウ。タイトルの右にあるボタンで、しまったり、広げたり。': 'Use the buttons near the title to minimize, expand, or close folder, video, and app windows.',
    '最小化 — いったんしまう': 'Minimize - tuck it away',
    '最大化 / 元に戻す — 画面いっぱいに、またもとの大きさに': 'Maximize / restore - full screen or original size',
    '閉じる — そのウィンドウを閉じる': 'Close - close that window',
    'ピン留め — よく開くものを覚えておく': 'Pin - remember frequently used windows',
    '左から、ピン留め・最小化・最大化・閉じる。': 'From left: pin, minimize, maximize, close.',
    '実際のウィンドウでは、タイトルのとなりに並びます。': 'In real windows, these sit beside the title.',
    '最小化': 'Minimize',
    'しまっても、すぐ戻せる。': 'Put it away and bring it back quickly.',
    '最小化したウィンドウは、画面の左下に小さく並びます。クリックすれば、また同じ場所に開きます。開いたままの作業を、じゃまにならない所へ。': 'Minimized windows line up at the bottom left. Click to reopen them in the same place, keeping open work out of the way.',
    '最小化したウィンドウは、画面の左下にまとまります。': 'Minimized windows gather at the bottom left.',
    'クリックすれば、また同じ場所に開きます。': 'Click to reopen them in the same place.',
    'ピン留め': 'Pin',
    'いつものものは、ピン留めしておく。': 'Pin the things you use often.',
    'ピンを押しておくと、次に開いたときの手間が消えます。ウィンドウと付箋で、はたらきが少しちがいます。': 'Pinning removes the setup step next time. It works a little differently for windows and sticky notes.',
    'フォルダ・ショートカット・アプリ・動画・音楽 — 次にひらいたとき、自動でそのウィンドウが出てきます': 'Folders, shortcuts, apps, videos, and music - the window opens automatically next time',
    '付箋 — 画面をスクロールしても、その場から動きません。いつも見える所に。': 'Sticky notes - stay fixed while you scroll, always visible',
    '色のついたピンが、ピン留め中の印。': 'A colored pin means it is pinned.',
    'どの操作も、その場でかんたん。': 'Every action is easy in place.',
    '右クリックも、ウィンドウのボタンも、いつものパソコンと同じ感覚で。覚えることは、ほとんどありません。': 'Right-clicks and window buttons feel like the computer you already know.',

    '細かなところまで、自分好みに。': 'Tune the details to your liking.',
    'ツールバーのギア（⚙）アイコンから、いつでも開けます。': 'Open settings anytime from the gear icon in the toolbar.',
    '設定画面のぜんぶ。': 'Everything in settings.',
    '変更はその場で保存。むずかしい設定はありません。': 'Changes save immediately. Nothing complicated.',
    '言語': 'Language',
    'アプリ全体の表示言語を切り替えます。メニューやボタンの文言がすべて変わります。': 'Switch the app display language. Menus and buttons change together.',
    '日本語': 'Japanese',
    '中文（简体）': 'Chinese (Simplified)',
    'Web検索 — 検索エンジン': 'Web search - search engine',
    'ツールバーのクイック検索や検索ウィンドウから Web を調べるときに使う検索エンジンを選びます。': 'Choose the search engine used by quick search and the search window.',
    'Webショートカット — 起動方法': 'Web shortcuts - launch behavior',
    'Webショートカットを開いたときの動きを選べます。いつものタブで開くか、画面を離れずアプリ内のウィンドウで開くか。': 'Choose whether web shortcuts open in a normal tab or in an in-app desktop window.',
    'デスクトップで開く（アプリ内のウィンドウ）': 'Open on desktop (in-app window)',
    'ウィンドウ — 上部バーのボタン配置': 'Window - button position',
    'フォルダや動画などのウィンドウにある、閉じる・最小化ボタンの位置を選べます。使い慣れた配置でどうぞ。': 'Choose where close and minimize buttons appear for folder, video, and other windows.',
    'Windowsタイプ（右）': 'Windows style (right)',
    'Macタイプ（左）': 'Mac style (left)',
    'ピクチャ イン ピクチャ': 'Picture-in-Picture',
    'デスクトップを小さなウィンドウに切り出して表示しているとき、タブやブラウザを閉じようとしたら確認を出すかどうか。うっかり消してしまうのを防げます。': 'Show a warning if you try to close the tab or browser while the desktop is popped out in a small window.',
    '閉じるときにアラートを表示（ON / OFF）': 'Show alert before closing (ON / OFF)',
    'インポート — お気に入り': 'Import - bookmarks',
    'ブラウザからエクスポートしたお気に入り（HTML）を選ぶと、これまでのブックマークをまとめてショートカットにできます。': 'Choose a bookmarks HTML file exported from your browser to turn bookmarks into shortcuts.',
    'ブラウザお気に入り(HTML)のインポート': 'Import browser bookmarks (HTML)',
    'アプリ設定 — バックアップ': 'App settings - backup',
    '並べたものや設定をまるごと 1 つの JSON ファイルに書き出し／読み込みできます。バックアップや、別の PC への引っ越しに。': 'Export or import everything as one JSON file for backup or moving to another PC.',
    'JSON のエクスポート': 'Export JSON',
    'JSON のインポート': 'Import JSON',
    'ツールバーから': 'From the toolbar',
    'よく使う切り替えは、ワンタッチ。': 'Common switches are one touch away.',
    '毎日変えるものは、設定を開かなくても上部のツールバーからすぐに。': 'Change daily settings from the top toolbar without opening the settings screen.',
    'テーマ — ライト / ダーク': 'Theme - light / dark',
    'グリッド吸着 — きれいに整列': 'Grid snap - neat alignment',
    'ミニマップ — 全体の表示 / 非表示': 'Minimap - show / hide overview',
    'ドラッグ操作 — 範囲選択 / 画面移動': 'Drag mode - select area / move screen',
    '表示倍率 — 50〜200%': 'Zoom - 50-200%',
    'デスクトップ — 1 / 2 / 3 を切り替え': 'Desktop - switch 1 / 2 / 3',
    '設定も、ぜんぶ手元に。': 'Settings stay with you too.',
    '変更した内容はこのブラウザの中に保存され、どこかに送られることはありません。': 'Changes are saved in this browser and are not sent anywhere.',
  };

  const attrEn = {
    'よく使うサイト、動画、メモ、自作アプリ。ぜんぶをひとつの画面に並べて、ワンクリックで。My Shortcuts は Microsoft Edge / Chrome 用の無料拡張機能です。': pageMeta['index.html'].description,
    'My Shortcuts 紹介動画': 'My Shortcuts introduction video',
    'My Shortcuts のデスクトップ。フォルダやサイトのアイコン、付箋が並んでいる様子': 'The My Shortcuts desktop with folders, site icons, and sticky notes.',
    '範囲をドラッグして複数のアイコンをまとめて選び、動かせるデスクトップ': 'Selecting and moving multiple desktop icons by dragging an area.',
    '上部の＋メニュー。フォルダ・Webショートカット・アプリ・付箋を選べる': 'The top plus menu for folders, web shortcuts, apps, and sticky notes.',
    'フォルダを開いたウィンドウ。中にショートカットが並んでいる様子': 'An open folder window containing shortcuts.',
    'My Shortcuts の中で、動画のウィンドウを開いて再生している様子': 'A video window playing inside My Shortcuts.',
    'My Shortcuts の中で、自作の時計アプリのウィンドウが動いている様子': 'A custom clock app running inside My Shortcuts.',
    '2つ目のデスクトップ画面。趣味のサイトとメモが並ぶ': 'The second desktop with hobby sites and notes.',
    'My Shortcuts の上部バーから開いたカレンダー。予定のある日に件数とタイトルが表示されている': 'A calendar opened from the top bar showing event counts and titles.',
    '検索ボックスに入力して、目当てのアイコンだけにしぼり込んだ状態': 'The search box filtering the desktop to matching icons.',
    'Web検索ウィンドウ。選んだ検索エンジンでそのまま検索できる': 'A web search window using the selected search engine.',
    'アイコンの右クリックメニュー': 'The right-click menu for an icon.',
    'ダークモードのデスクトップ': 'The desktop in dark mode.',
    '設定画面。言語やバックアップの項目': 'Settings screen with language and backup options.',
    '拡張機能をオンにする': 'Turning on the extension.',
    '拡張機能メニューで My Shortcuts のピンを押してツールバーに固定する': 'Pinning My Shortcuts from the extension menu to the toolbar.',
    'ツールバーの My Shortcuts アイコンをクリックしてアプリを開く': 'Clicking the My Shortcuts toolbar icon to open the app.',
    'アドレスバーの星マークで拡張機能ページをお気に入りに登録する': 'Adding the extension page to favorites with the address bar star.',
    '設定の起動時で特定のページを開くに拡張機能ページを追加する': 'Adding the extension page to browser startup settings.',
  };

  const originalText = new WeakMap();
  const originalAttrs = new WeakMap();

  const getStoredLanguage = () => {
    const urlLang = new URLSearchParams(window.location.search).get('lang');
    if (SUPPORTED.has(urlLang)) {
      localStorage.setItem(STORAGE_KEY, urlLang);
      return urlLang;
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (SUPPORTED.has(saved)) return saved;
    const browserLanguages = navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || ''];
    const primaryLanguage = (browserLanguages[0] || '').toLowerCase();
    return primaryLanguage.startsWith('ja') ? 'ja' : 'en';
  };

  const privacyPathFor = (lang) => {
    const inEnDir = window.location.pathname.includes('/en/');
    if (lang === 'en') return inEnDir ? 'privacy-policy-en.html' : 'privacy-policy-en.html';
    return inEnDir ? '../privacy-policy.html' : 'privacy-policy.html';
  };

  const maybeRedirectPrivacy = (lang) => {
    const file = pageName();
    if (lang === 'en' && file === 'privacy-policy.html') {
      window.location.href = 'privacy-policy-en.html';
      return true;
    }
    if (lang === 'ja' && file === 'privacy-policy-en.html') {
      window.location.href = privacyPathFor('ja');
      return true;
    }
    return false;
  };

  const addSwitcher = (lang) => {
    const nav = document.getElementById('nav');
    if (!nav || nav.querySelector('.nav__lang')) return;
    const switcher = document.createElement('div');
    switcher.className = 'nav__lang';
    switcher.setAttribute('aria-label', 'Language');
    switcher.innerHTML = '<button type="button" data-lang-choice="ja" lang="ja">JA</button><button type="button" data-lang-choice="en" lang="en">EN</button>';
    const cta = nav.querySelector('.nav__cta');
    nav.insertBefore(switcher, cta || null);
    switcher.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-lang-choice]');
      if (!button) return;
      const next = button.dataset.langChoice;
      if (!SUPPORTED.has(next)) return;
      localStorage.setItem(STORAGE_KEY, next);
      if (!maybeRedirectPrivacy(next)) applyLanguage(next);
    });
    updateSwitcher(lang);
  };

  const updateSwitcher = (lang) => {
    document.querySelectorAll('.nav__lang button').forEach((button) => {
      const active = button.dataset.langChoice === lang;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  };

  const translateTextNodes = (lang) => {
    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (!originalText.has(node)) originalText.set(node, node.nodeValue);
        const original = originalText.get(node);
        const trimmed = original.replace(/\s+/g, ' ').trim();
        if (lang === 'ja') {
          node.nodeValue = original;
        } else if (en[trimmed]) {
          const leading = original.match(/^\s*/)[0];
          const trailing = original.match(/\s*$/)[0];
          node.nodeValue = `${leading}${en[trimmed]}${trailing}`;
        }
        return;
      }
      if (!node.childNodes || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG'].includes(node.nodeName)) return;
      Array.from(node.childNodes).forEach(walk);
    };
    walk(document.body);
  };

  const translateAttributes = (lang) => {
    document.querySelectorAll('[alt],[title],meta[name="description"]').forEach((element) => {
      ['alt', 'title', 'content'].forEach((attr) => {
        if (!element.hasAttribute(attr)) return;
        if (!originalAttrs.has(element)) originalAttrs.set(element, {});
        const originals = originalAttrs.get(element);
        if (!Object.prototype.hasOwnProperty.call(originals, attr)) originals[attr] = element.getAttribute(attr);
        const original = originals[attr];
        if (lang === 'ja') {
          element.setAttribute(attr, original);
        } else if (attrEn[original] || en[original]) {
          element.setAttribute(attr, attrEn[original] || en[original]);
        }
      });
    });
  };

  const updateMeta = (lang) => {
    const meta = pageMeta[pageName()];
    if (!meta) return;
    if (lang === 'en') {
      document.title = meta.title;
      const description = document.querySelector('meta[name="description"]');
      if (description) description.setAttribute('content', meta.description);
    } else {
      const description = document.querySelector('meta[name="description"]');
      document.title = originalDocumentTitle;
      if (description && originalAttrs.has(description)) {
        description.setAttribute('content', originalAttrs.get(description).content || description.getAttribute('content'));
      }
    }
  };

  const updateLinks = (lang) => {
    document.querySelectorAll('a[href="privacy-policy.html"], a[href="privacy-policy-en.html"]').forEach((link) => {
      link.setAttribute('href', privacyPathFor(lang));
    });
  };

  const applyLanguage = (lang) => {
    document.documentElement.lang = lang;
    document.documentElement.dataset.lang = lang;
    addSwitcher(lang);
    translateTextNodes(lang);
    translateAttributes(lang);
    updateMeta(lang);
    updateLinks(lang);
    updateSwitcher(lang);
  };

  const initialLanguage = getStoredLanguage();
  if (!maybeRedirectPrivacy(initialLanguage)) applyLanguage(initialLanguage);
})();

// Subtle scroll-reveal + nav state. Gentle by design — respects reduced motion.
(() => {
  const nav = document.getElementById('nav');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Nav gains a hairline border once the page scrolls.
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 10);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Reveal elements as they enter the viewport, with a soft stagger per section.
  const items = Array.from(document.querySelectorAll('.reveal'));
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const siblings = Array.from(el.parentElement.querySelectorAll(':scope > .reveal'));
        const idx = Math.max(0, siblings.indexOf(el));
        el.style.transitionDelay = `${Math.min(idx * 90, 270)}ms`;
        el.classList.add('is-in');
        io.unobserve(el);
      });
    },
    { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
  );
  items.forEach((el) => io.observe(el));
})();

// "動画で見る" chip → start playback.
(() => {
  const trigger = document.getElementById('videoPlay');
  const video = document.querySelector('.videosec video');
  const iframe = document.querySelector('.videosec iframe');
  if (!trigger || (!video && !iframe)) return;
  const play = () => {
    const player = video || iframe;
    player.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (video) {
      video.play().catch(() => {});
      return;
    }
    const src = new URL(iframe.src);
    src.searchParams.set('autoplay', '1');
    iframe.src = src.toString();
  };
  trigger.addEventListener('click', play);
  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); }
  });
})();

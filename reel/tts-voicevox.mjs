/**
 * Generates narration WAVs (n0..n7) with the local VOICEVOX engine.
 *   1) Launch VOICEVOX (engine listens on http://127.0.0.1:50021)
 *   2) node tts-voicevox.mjs [speakerStyleId]
 *
 * Reads narration.txt (UTF-8). Picks a calm/narration-style voice automatically,
 * or pass a style id to override (see the printed speaker list).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'audio');
fs.mkdirSync(OUT, { recursive: true });
const HOST = 'http://127.0.0.1:50021';

// tuning for a fluent read
const SPEED = 1.0;       // speedScale
const PITCH = 0.0;       // pitchScale
const INTON = 1.1;       // intonationScale (slightly more expressive)
const POST_SILENCE = 0.1;

const lines = fs.readFileSync(path.join(__dirname, 'narration.txt'), 'utf8')
  .split(/\r?\n/).map((s) => s.trim()).filter(Boolean);

async function getJson(url, opts) {
  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(`${url} -> ${r.status} ${await r.text()}`);
  return r.json();
}

async function pickSpeaker(override) {
  const speakers = await getJson(`${HOST}/speakers`);
  const flat = [];
  for (const sp of speakers) for (const st of sp.styles) flat.push({ id: st.id, label: `${sp.name} / ${st.name}` });
  if (override != null) {
    const m = flat.find((f) => f.id === Number(override));
    if (!m) throw new Error(`speaker style id ${override} not found`);
    return m;
  }
  // prefer narration-ish styles, then calm voices
  const styleHit = flat.find((f) => /ナレーション|アナウンス|読み聞かせ|朗読/.test(f.label));
  if (styleHit) return styleHit;
  for (const name of ['No.7', '九州そら', 'WhiteCUL', 'もち子', '四国めたん', 'ずんだもん']) {
    const hit = flat.find((f) => f.label.startsWith(name) && /ノーマル|普通/.test(f.label));
    if (hit) return hit;
  }
  return flat[0];
}

async function synth(text, speaker) {
  const query = await getJson(`${HOST}/audio_query?speaker=${speaker}&text=${encodeURIComponent(text)}`, { method: 'POST' });
  query.speedScale = SPEED;
  query.pitchScale = PITCH;
  query.intonationScale = INTON;
  query.postPhonemeLength = POST_SILENCE;
  const r = await fetch(`${HOST}/synthesis?speaker=${speaker}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(query),
  });
  if (!r.ok) throw new Error(`synthesis -> ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

(async () => {
  try {
    const ver = await (await fetch(`${HOST}/version`)).text();
    console.log('VOICEVOX engine version:', ver.replace(/"/g, ''));
  } catch {
    console.error('\n✗ VOICEVOX エンジンに接続できません (http://127.0.0.1:50021)。');
    console.error('  VOICEVOX アプリを起動してから、もう一度実行してください。\n');
    process.exit(1);
  }

  if (process.argv[2] === '--list') {
    const speakers = await getJson(`${HOST}/speakers`);
    for (const sp of speakers) for (const st of sp.styles) console.log(`id=${st.id}\t${sp.name} / ${st.name}`);
    return;
  }

  const voice = await pickSpeaker(process.argv[2]);
  console.log(`voice: ${voice.label}  (style id=${voice.id})`);
  console.log('（別の声にするには:  node tts-voicevox.mjs <id>  。一覧は --list）\n');

  for (let i = 0; i < lines.length; i++) {
    const wav = await synth(lines[i], voice.id);
    const p = path.join(OUT, `n${i}.wav`);
    fs.writeFileSync(p, wav);
    console.log(`  n${i}.wav  ${(wav.length / 1024).toFixed(0)}KB  «${lines[i]}»`);
  }
  // New voice = new line lengths = new timeline, so the VIDEO must follow it too.
  console.log('\n✅ narration regenerated with VOICEVOX.');
  console.log('   Next (full rebuild, keeps A/V in sync):  node render-frames.mjs && node build.mjs');
})().catch((e) => { console.error(e); process.exit(1); });

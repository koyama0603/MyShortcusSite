/**
 * Rebuilds ONLY the audio (louder narration + higher-quality, hard-ducked music)
 * and remuxes it onto the existing MP4 video stream (no frame re-render).
 *   node rebuild-audio.mjs
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const audioDir = path.join(__dirname, 'audio');
const workRoot = path.resolve(__dirname, '..', '..');
const mp4 = path.join(workRoot, 'My-Shortcuts-紹介.mp4');
const tmpMp4 = path.join(workRoot, '_av_tmp.mp4');

const FF = ['C:/Users/koyam/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe', 'ffmpeg']
  .find((p) => p === 'ffmpeg' || fs.existsSync(p)) || 'ffmpeg';

const tl = JSON.parse(fs.readFileSync(path.join(__dirname, 'timeline.json'), 'utf8'));

function ff(label, args) {
  console.log(`\n[${label}]`);
  const r = spawnSync(FF, args, { stdio: ['ignore', 'inherit', 'inherit'] });
  if (r.status !== 0) throw new Error(`${label} failed (exit ${r.status})`);
}

// 1) regenerate higher-quality music at the exact length
console.log('[music]', tl.total.toFixed(2) + 's');
const m = spawnSync(process.execPath, [path.join(__dirname, 'make-music.mjs'), String(tl.total)],
  { stdio: ['ignore', 'inherit', 'inherit'] });
if (m.status !== 0) throw new Error('music generation failed');

// 2) mix: narration boosted up front, music kept low and hard-ducked under speech
const inputs = ['-i', path.join(audioDir, 'music.wav')];
for (let i = 0; i < 8; i++) inputs.push('-i', path.join(audioDir, `n${i}.wav`));

const parts = [];
const labels = [];
for (let i = 0; i < 8; i++) {
  const d = Math.round(tl.scenes[i].narrationStart * 1000);
  parts.push(`[${i + 1}]adelay=${d}:all=1,aformat=sample_rates=44100:channel_layouts=stereo[a${i}]`);
  labels.push(`[a${i}]`);
}
parts.push(`${labels.join('')}amix=inputs=8:normalize=0[narsum]`);
// split narration: [nar] feeds the mix, [narkey] keys the music ducking
parts.push(`[narsum]volume=3.0,alimiter=limit=0.97,asplit=2[nar][narkraw]`);
parts.push(`[narkraw]apad[narkey]`); // pad key so ducking runs the full music length
parts.push(`[0]aformat=sample_rates=44100:channel_layouts=stereo,volume=0.45[bg]`);
parts.push(`[bg][narkey]sidechaincompress=threshold=0.025:ratio=14:attack=5:release=320[duck]`);
parts.push(`[duck][nar]amix=inputs=2:normalize=0,alimiter=limit=0.97[aout]`);

const mixed = path.join(audioDir, 'mixed.wav');
ff('mix-audio', [
  '-y', ...inputs,
  '-filter_complex', parts.join(';'),
  '-map', '[aout]', '-t', String(tl.total), '-ar', '44100', '-ac', '2', mixed,
]);

// 3) remux audio onto the existing video (copy video, no re-encode of frames)
ff('remux', [
  '-y', '-i', mp4, '-i', mixed,
  '-map', '0:v:0', '-map', '1:a:0',
  '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
  '-movflags', '+faststart', '-shortest', tmpMp4,
]);
fs.rmSync(mp4, { force: true });
fs.renameSync(tmpMp4, mp4);

const mb = (fs.statSync(mp4).size / 1048576).toFixed(1);
console.log(`\n✅ ${mp4}  (${mb} MB)  — narration boosted, music v2`);

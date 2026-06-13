/**
 * Builds the final 1080p MP4: generates BGM to the timeline length, mixes
 * narration (placed per scene) + ducked music, and muxes with the rendered
 * frames into H.264 + AAC.
 *   node build.mjs        (run AFTER render-frames.mjs)
 * Output: ../../My-Shortcuts-紹介.mp4 (working folder root)
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { FPS } from './timeline.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const audioDir = path.join(__dirname, 'audio');
const framesDir = path.join(__dirname, '.frames');
const workRoot = path.resolve(__dirname, '..', '..');
const outMp4 = path.join(workRoot, 'My-Shortcuts-紹介.mp4');

const FF = ['C:/Users/koyam/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe', 'ffmpeg']
  .find((p) => p === 'ffmpeg' || fs.existsSync(p)) || 'ffmpeg';

const tl = JSON.parse(fs.readFileSync(path.join(__dirname, 'timeline.json'), 'utf8'));

function run(label, args) {
  console.log(`\n[${label}]`);
  const r = spawnSync(FF, args, { stdio: ['ignore', 'inherit', 'inherit'] });
  if (r.status !== 0) throw new Error(`${label} failed (exit ${r.status})`);
}

// 1) BGM to total length
console.log('[music] generating', tl.total.toFixed(2) + 's');
const m = spawnSync(process.execPath, [path.join(__dirname, 'make-music.mjs'), String(tl.total)],
  { stdio: ['ignore', 'inherit', 'inherit'] });
if (m.status !== 0) throw new Error('music generation failed');

// 2) Mix: narration placed at each scene start; music ducked beneath it
const music = path.join(audioDir, 'music.wav');
const inputs = ['-i', music];
for (let i = 0; i < 8; i++) inputs.push('-i', path.join(audioDir, `n${i}.wav`));

const parts = [];
const labels = [];
for (let i = 0; i < 8; i++) {
  const d = Math.round(tl.scenes[i].narrationStart * 1000);
  parts.push(`[${i + 1}]adelay=${d}:all=1,aformat=sample_rates=44100:channel_layouts=stereo[a${i}]`);
  labels.push(`[a${i}]`);
}
parts.push(`${labels.join('')}amix=inputs=8:normalize=0[narsum]`);
parts.push(`[narsum]volume=3.0,alimiter=limit=0.97,asplit=2[nar][narkraw]`);
parts.push(`[narkraw]apad[narkey]`); // pad key so ducking runs the full music length
parts.push(`[0]aformat=sample_rates=44100:channel_layouts=stereo,volume=0.45[bg]`);
parts.push(`[bg][narkey]sidechaincompress=threshold=0.025:ratio=14:attack=5:release=320[duck]`);
parts.push(`[duck][nar]amix=inputs=2:normalize=0,alimiter=limit=0.97[aout]`);

const mixed = path.join(audioDir, 'mixed.wav');
run('mix-audio', [
  '-y', ...inputs,
  '-filter_complex', parts.join(';'),
  '-map', '[aout]', '-t', String(tl.total),
  '-ar', '44100', '-ac', '2', mixed,
]);

// 3) Encode frames + audio -> MP4
run('encode-mp4', [
  '-y',
  '-framerate', String(FPS),
  '-i', path.join(framesDir, 'frame-%05d.jpg'),
  '-i', mixed,
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium',
  '-c:a', 'aac', '-b:a', '192k',
  '-movflags', '+faststart', '-shortest',
  outMp4,
]);

const mb = (fs.statSync(outMp4).size / 1024 / 1024).toFixed(1);
console.log(`\n✅ ${outMp4}  (${mb} MB, ${tl.total.toFixed(1)}s, 1920x1080, ${FPS}fps)`);

// Shared timeline: scene durations derived from narration WAV lengths.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const FPS = 30;
export const LEAD = 0.35; // gap before narration starts within a scene

function wavDuration(file) {
  const b = fs.readFileSync(file);
  let ch = 1, sr = 16000, bps = 16, dataLen = 0, o = 12;
  while (o + 8 <= b.length) {
    const id = b.toString('ascii', o, o + 4);
    const sz = b.readUInt32LE(o + 4);
    if (id === 'fmt ') { ch = b.readUInt16LE(o + 10); sr = b.readUInt32LE(o + 12); bps = b.readUInt16LE(o + 22); }
    else if (id === 'data') { dataLen = sz; }
    o += 8 + sz + (sz & 1);
  }
  return dataLen / (sr * ch * (bps / 8));
}

const snap = (s) => Math.round(s * FPS) / FPS; // align to frame grid

export function computeTimeline() {
  const audioDir = path.join(__dirname, 'audio');
  const narr = [];
  for (let i = 0; i < 8; i++) narr.push(wavDuration(path.join(audioDir, `n${i}.wav`)));

  const scenes = [];
  let start = 0;
  narr.forEach((nd, i) => {
    const tail = i === 7 ? 1.15 : 0.6;     // a touch more air on the outro
    const minDur = i === 0 ? 4.5 : 3.4;
    const dur = snap(Math.max(minDur, LEAD + nd + tail));
    scenes.push({
      start: snap(start),
      dur,
      narrationStart: snap(start + LEAD),
      narrationDur: nd,
    });
    start += dur;
  });
  const total = snap(start);
  return { fps: FPS, lead: LEAD, total, scenes };
}

export function writeTimeline() {
  const tl = computeTimeline();
  fs.writeFileSync(path.join(__dirname, 'timeline.json'), JSON.stringify(tl, null, 2));
  return tl;
}

/**
 * Warm, gentle, royalty-free background track (no deps).
 *   node make-music.mjs [seconds]  -> audio/music.wav
 *
 * Quality goals (vs. the first chiptune version):
 *  - warm timbres: electric-piano-ish additive voice + soft pad (no harsh tri/square)
 *  - space: a Freeverb-style reverb removes the dry "beepy" feel
 *  - no repetition: 16-bar chord cycle + a composed melody + section dynamics
 *  - light, bright groove: soft kick + filtered-noise shaker (no woodblock blips)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'audio');
fs.mkdirSync(OUT, { recursive: true });

const SR = 44100;
const TOTAL = Math.max(8, Number(process.argv[2]) || 50);
const N = Math.ceil(TOTAL * SR);
const L = new Float32Array(N);
const R = new Float32Array(N);
const SEND = new Float32Array(N); // mono reverb send

const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
const BPM = 104;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;

// place a mono sample buffer into L/R (pan) and the reverb send
function place(startSec, samples, pan = 0, send = 0.18) {
  const s0 = Math.floor(startSec * SR);
  const gl = pan <= 0 ? 1 : 1 - pan;
  const gr = pan >= 0 ? 1 : 1 + pan;
  for (let i = 0; i < samples.length; i++) {
    const idx = s0 + i;
    if (idx < 0 || idx >= N) continue;
    const v = samples[i];
    L[idx] += v * gl;
    R[idx] += v * gr;
    SEND[idx] += v * send;
  }
}

// electric-piano-ish voice: additive partials + exponential decay
function ep(dur, freq, gain) {
  const len = Math.floor(dur * SR);
  const out = new Float32Array(len);
  const atk = Math.max(1, Math.floor(0.006 * SR));
  const tau = dur * 0.45;
  const partials = [[1, 1.0], [2, 0.5], [3, 0.22], [4, 0.09], [6, 0.04]];
  const det = 1.0015;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const env = Math.min(1, i / atk) * Math.exp(-t / tau);
    if (env < 1e-4) { if (i > atk) break; }
    let s = 0;
    for (const [h, a] of partials) {
      s += Math.sin(2 * Math.PI * freq * h * t) * a;
      s += Math.sin(2 * Math.PI * freq * h * det * t) * a * 0.5;
    }
    out[i] = (s / 2.4) * env * gain;
  }
  return out;
}

// soft sustained pad (chord), warm low harmonics with slow attack/release
function pad(dur, freqs, gain) {
  const len = Math.floor(dur * SR);
  const out = new Float32Array(len);
  const atk = Math.floor(0.35 * SR);
  const rel = Math.floor(0.55 * SR);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    let env;
    if (i < atk) env = i / atk;
    else if (i > len - rel) env = Math.max(0, (len - i) / rel);
    else env = 1;
    let s = 0;
    for (const f of freqs) {
      s += Math.sin(2 * Math.PI * f * t)
        + 0.28 * Math.sin(2 * Math.PI * 2 * f * t)
        + 0.1 * Math.sin(2 * Math.PI * 3 * f * t)
        + 0.5 * Math.sin(2 * Math.PI * f * 1.004 * t); // chorus detune
    }
    out[i] = (s / (freqs.length * 2.2)) * env * gain;
  }
  return out;
}

function bass(dur, freq, gain) {
  const len = Math.floor(dur * SR);
  const out = new Float32Array(len);
  const atk = Math.floor(0.008 * SR);
  const tau = dur * 0.6;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const env = Math.min(1, i / atk) * Math.exp(-t / tau);
    out[i] = (Math.sin(2 * Math.PI * freq * t) + 0.22 * Math.sin(2 * Math.PI * 2 * freq * t)) * env * gain;
  }
  return out;
}

// soft kick (sine pitch drop)
function kick(startSec, gain = 0.42) {
  const len = Math.floor(0.16 * SR);
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const f = 115 * Math.exp(-t * 26) + 44;
    out[i] = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 19) * gain;
  }
  place(startSec, out, 0, 0.04);
}

// filtered-noise shaker (airy, not beepy)
function shaker(startSec, gain = 0.05, pan = 0) {
  const len = Math.floor(0.06 * SR);
  const out = new Float32Array(len);
  let hp = 0, prev = 0;
  for (let i = 0; i < len; i++) {
    const n = Math.random() * 2 - 1;
    hp = 0.85 * (hp + n - prev); // simple high-pass
    prev = n;
    const env = Math.exp(-i / SR * 55);
    out[i] = hp * env * gain;
  }
  place(startSec, out, pan, 0.10);
}

// ---- arrangement ----------------------------------------------------------
// 16-bar chord cycle (root pad notes / bass root). Bright, with a B-half twist.
const CH = [
  { pad: [60, 64, 67], bass: 48 }, // C
  { pad: [55, 59, 62], bass: 43 }, // G
  { pad: [57, 60, 64], bass: 45 }, // Am
  { pad: [53, 57, 60], bass: 41 }, // F
  { pad: [60, 64, 67], bass: 48 }, // C
  { pad: [55, 59, 62], bass: 43 }, // G
  { pad: [53, 57, 60], bass: 41 }, // F
  { pad: [55, 59, 62], bass: 43 }, // G
  { pad: [57, 60, 64], bass: 45 }, // Am
  { pad: [53, 57, 60], bass: 41 }, // F
  { pad: [60, 64, 67], bass: 48 }, // C
  { pad: [55, 59, 62], bass: 43 }, // G
  { pad: [53, 57, 60], bass: 41 }, // F
  { pad: [55, 59, 62], bass: 43 }, // G
  { pad: [60, 64, 67], bass: 48 }, // C
  { pad: [55, 59, 62], bass: 43 }, // G
];
// arpeggio tones per bar (chord tones, mid register)
const ARP = CH.map((c) => c.pad.map((m) => m + 12));
// gentle composed melody: [startBeat, durBeats, midi] per bar (chord tones)
const MEL = [
  [[0, 1, 72], [1.5, 0.5, 76], [2, 2, 79]],
  [[0, 1, 79], [1, 1, 74], [2, 2, 71]],
  [[0, 1, 72], [1, 1, 69], [2, 2, 76]],
  [[0, 1, 77], [1, 1, 72], [2, 2, 69]],
  [[0, 1, 76], [1, 1, 72], [2, 2, 67]],
  [[0, 1, 74], [1.5, 0.5, 79], [2, 2, 71]],
  [[0, 1, 77], [1, 1, 81], [2, 2, 77]],
  [[0, 2, 79], [2, 2, 74]],
  [[0, 1, 81], [1, 1, 76], [2, 2, 72]],
  [[0, 1, 77], [1.5, 0.5, 81], [2, 2, 84]],
  [[0, 1, 79], [1, 1, 76], [2, 2, 72]],
  [[0, 1, 74], [1, 1, 71], [2, 2, 67]],
  [[0, 1, 69], [1, 1, 72], [2, 2, 77]],
  [[0, 1, 79], [1, 1, 74], [2, 2, 71]],
  [[0, 2, 72], [2, 2, 76]],
  [[0, 4, 79]],
];
const ARP_PATTERNS = [
  [0, 1, 2, 1, 0, 1, 2, 1],
  [0, 1, 2, 3 % 3, 2, 1, 0, 2 % 3],
  [2, 1, 0, 1, 2, 1, 0, 1],
  [0, 2, 1, 2, 0, 2, 1, 2],
];

const nBars = Math.ceil(TOTAL / BAR) + 1;
for (let b = 0; b < nBars; b++) {
  const t0 = b * BAR;
  const ci = b % 16;
  const ch = CH[ci];
  const isIntro = b < 2;
  const isOutro = b >= nBars - 2;
  const gain = isIntro ? 0.55 + b * 0.16 : isOutro ? 0.9 - (b - (nBars - 2)) * 0.25 : 1;

  // pad (always)
  place(t0, pad(BAR + 0.2, ch.pad.map(midi), 0.16 * gain), 0, 0.26);

  // bass (main only)
  if (!isIntro && !isOutro) {
    place(t0, bass(BEAT * 1.6, midi(ch.bass), 0.2 * gain), 0, 0.05);
    place(t0 + 2 * BEAT, bass(BEAT * 1.6, midi(ch.bass), 0.18 * gain), 0, 0.05);
  }

  // arpeggio (intro + main), soft EP, panned gently
  if (!isOutro) {
    const tones = ARP[ci];
    const pat = ARP_PATTERNS[b % ARP_PATTERNS.length];
    for (let e = 0; e < 8; e++) {
      const note = tones[pat[e] % tones.length];
      const pan = e % 2 === 0 ? -0.22 : 0.22;
      place(t0 + e * (BEAT / 2), ep(BEAT * 0.95, midi(note), 0.09 * gain * (isIntro ? 0.8 : 1)), pan, 0.22);
    }
  }

  // melody (main + outro), warm EP, centred, more reverb
  if (!isIntro) {
    for (const [sb, db, m] of MEL[ci]) {
      place(t0 + sb * BEAT, ep(db * BEAT * 1.05, midi(m), 0.14 * gain), 0.04, 0.3);
    }
  }

  // light groove (main only)
  if (!isIntro && !isOutro) {
    kick(t0, 0.4 * gain);
    kick(t0 + 2 * BEAT, 0.34 * gain);
    for (let e = 1; e < 8; e += 2) shaker(t0 + e * (BEAT / 2), 0.045 * gain, e % 4 === 1 ? -0.2 : 0.2);
  }
}

// ---- Freeverb-style reverb on the send ------------------------------------
function freeverb(input, spread) {
  const combs = [1116, 1188, 1277, 1356, 1422, 1491].map((d) => d + spread);
  const aps = [556, 441, 341, 225].map((d) => d + spread);
  const fb = 0.84, damp = 0.2;
  const out = new Float32Array(input.length);
  for (const d of combs) {
    const buf = new Float32Array(d);
    let idx = 0, lp = 0;
    for (let i = 0; i < input.length; i++) {
      const y = buf[idx];
      lp = y * (1 - damp) + lp * damp;
      buf[idx] = input[i] + lp * fb;
      idx = idx + 1 === d ? 0 : idx + 1;
      out[i] += y;
    }
  }
  for (let i = 0; i < out.length; i++) out[i] /= combs.length;
  for (const d of aps) {
    const buf = new Float32Array(d);
    let idx = 0; const g = 0.5;
    for (let i = 0; i < out.length; i++) {
      const bo = buf[idx];
      const y = -out[i] + bo;
      buf[idx] = out[i] + bo * g;
      idx = idx + 1 === d ? 0 : idx + 1;
      out[i] = y;
    }
  }
  return out;
}
const wetL = freeverb(SEND, 0);
const wetR = freeverb(SEND, 23);
const WET = 0.30;
for (let i = 0; i < N; i++) { L[i] += wetL[i] * WET; R[i] += wetR[i] * WET; }

// ---- master: gentle low-pass, soft saturation, normalize, fades -----------
const a = 1 - Math.exp(-2 * Math.PI * 9000 / SR);
let yl = 0, yr = 0;
for (let i = 0; i < N; i++) {
  yl += a * (L[i] - yl); L[i] = yl;
  yr += a * (R[i] - yr); R[i] = yr;
}
let peak = 1e-6;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const norm = 0.78 / peak;
const fadeIn = Math.floor(1.2 * SR);
const fadeOut = Math.floor(2.0 * SR);
const sat = (x) => Math.tanh(x * 1.05);

const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8);
buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
let o = 44;
for (let i = 0; i < N; i++) {
  let fade = 1;
  if (i < fadeIn) fade = i / fadeIn;
  else if (i > N - fadeOut) fade = Math.max(0, (N - i) / fadeOut);
  const l = Math.max(-1, Math.min(1, sat(L[i] * norm) * fade));
  const r = Math.max(-1, Math.min(1, sat(R[i] * norm) * fade));
  buf.writeInt16LE((l * 32767) | 0, o); o += 2;
  buf.writeInt16LE((r * 32767) | 0, o); o += 2;
}
fs.writeFileSync(path.join(OUT, 'music.wav'), buf);
console.log(`music.wav  ${TOTAL.toFixed(1)}s  ${(buf.length / 1048576).toFixed(1)}MB  (${nBars} bars @ ${BPM}bpm)`);

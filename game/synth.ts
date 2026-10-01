export type SfxName = "coin" | "crash" | "click" | "swoosh" | "tick" | "go" | "jump";
export const SFX_NAMES: SfxName[] = ["coin", "crash", "click", "swoosh", "tick", "go", "jump"];
const RATE = 22050;
const TAU = Math.PI * 2;
type Wave = "sine" | "square" | "tri";

const make = (seconds: number) => new Float32Array(Math.floor(seconds * RATE));

// A pitched note. Envelope goes to zero at the end, so there are no clicks.
function tone(
  buf: Float32Array,
  start: number,
  dur: number,
  f0: number,
  f1: number,
  vol: number,
  wave: Wave,
  decay: number
) {
  const s0 = Math.floor(start * RATE);
  const n = Math.floor(dur * RATE);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const idx = s0 + i;
    if (idx >= buf.length) break;
    const t = i / n;
    phase += (f0 + (f1 - f0) * t) / RATE;
    const p = phase % 1;
    const raw =
      wave === "sine" ? Math.sin(TAU * p) : wave === "square" ? (p < 0.5 ? 0.6 : -0.6) : 4 * Math.abs(p - 0.5) - 1;
    const env = Math.min(1, i / (RATE * 0.004)) * Math.exp(-decay * t) * (1 - t);
    buf[idx] += raw * env * vol;
  }
}

// Low-passed noise. a0 -> a1 is the filter openness (small = dark).
function noise(
  buf: Float32Array,
  start: number,
  dur: number,
  vol: number,
  a0: number,
  a1: number,
  shape: "decay" | "bell"
) {
  const s0 = Math.floor(start * RATE);
  const n = Math.floor(dur * RATE);
  let y = 0;
  for (let i = 0; i < n; i++) {
    const idx = s0 + i;
    if (idx >= buf.length) break;
    const t = i / n;
    const a = a0 + (a1 - a0) * t;
    y += a * (Math.random() * 2 - 1 - y);
    const env = shape === "bell" ? Math.sin(Math.PI * t) : Math.exp(-5 * t) * (1 - t);
    buf[idx] += y * env * vol;
  }
}

function toWavDataUri(samples: Float32Array): string {
  const n = samples.length;
  const buf = new ArrayBuffer(44 + n * 2);
  const v = new DataView(buf);
  const str = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
  };
  str(0, "RIFF");
  v.setUint32(4, 36 + n * 2, true);
  str(8, "WAVE");
  str(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); // PCM
  v.setUint16(22, 1, true); // mono
  v.setUint32(24, RATE, true);
  v.setUint32(28, RATE * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  str(36, "data");
  v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...Array.from(bytes.subarray(i, i + 0x8000)));
  }
  return "data:audio/wav;base64," + btoa(bin);
}

export function synthSfx(name: SfxName): string {
  let b: Float32Array;
  switch (name) {
    case "coin":
      b = make(0.3);
      tone(b, 0, 0.08, 988, 988, 0.5, "square", 2);
      tone(b, 0.08, 0.22, 1319, 1319, 0.5, "square", 4);
      break;
    case "crash":
      b = make(0.7);
      noise(b, 0, 0.65, 2.2, 0.5, 0.04, "decay");
      tone(b, 0, 0.55, 120, 38, 0.9, "sine", 3);
      break;
    case "click":
      b = make(0.06);
      tone(b, 0, 0.05, 720, 520, 0.7, "sine", 3);
      break;
    case "swoosh":
      b = make(0.25);
      noise(b, 0, 0.22, 2.5, 0.06, 0.35, "bell");
      break;
    case "tick":
      b = make(0.12);
      tone(b, 0, 0.1, 440, 440, 0.7, "sine", 3);
      break;
    case "go":
      b = make(0.4);
      tone(b, 0, 0.35, 880, 880, 0.5, "square", 3);
      tone(b, 0, 0.35, 1320, 1320, 0.25, "square", 3);
      break;
        case "jump":
      b = make(0.22);
      tone(b, 0, 0.2, 280, 620, 0.55, "sine", 3);
      break;
  }
  return toWavDataUri(b);
}

// 4 bars of Am - F - C - G at 124 BPM: kick, bass, arpeggio, hats. ~7.7 s, loops seamlessly.
export function synthMusic(): string {
  const beat = 60 / 124;
  const buf = make(16 * beat);
  const hz = (m: number) => 440 * 2 ** ((m - 69) / 12);

  const chords = [
    [57, 60, 64], // Am
    [53, 57, 60], // F
    [48, 52, 55], // C
    [55, 59, 62], // G
  ];
  const bass = [33, 29, 36, 31];
  const pattern = [0, 1, 2, 1, 0, 1, 2, 1];

  for (let bar = 0; bar < 4; bar++) {
    const t0 = bar * 4 * beat;
    for (let b = 0; b < 4; b++) {
      const t = t0 + b * beat;
      tone(buf, t, 0.14, 140, 45, 0.4, "sine", 3);                       // kick
      tone(buf, t, beat * 0.9, hz(bass[bar]), hz(bass[bar]), 0.22, "tri", 2.5); // bass
      noise(buf, t + beat / 2, 0.05, 0.25, 0.9, 0.9, "decay");           // off-beat hat
    }
    for (let e = 0; e < 8; e++) {
      const m = chords[bar][pattern[e]] + 12;
      tone(buf, t0 + (e * beat) / 2, (beat / 2) * 0.9, hz(m), hz(m), 0.12, "square", 3);
    }
  }
  return toWavDataUri(buf);
}
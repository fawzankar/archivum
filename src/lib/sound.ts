// Synthesised "pop" sounds (Web Audio): a soft, rounded bubble pop with a faint click on top.
// No audio files, nothing to download, works offline.
const KEY = 'archivum-sound';
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;

export function isSoundOn(): boolean {
  try { return localStorage.getItem(KEY) !== 'off'; } catch { return true; }
}
export function setSoundOn(on: boolean) {
  try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch { /* storage blocked */ }
  window.dispatchEvent(new Event('archivum:sound-changed'));
}

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
      // Master chain keeps everything smooth and never harsh: gentle low-pass, light compression.
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 7000; lp.Q.value = 0.5;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18; comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.12;
      master = ctx.createGain(); master.gain.value = 0.9;
      master.connect(lp); lp.connect(comp); comp.connect(ctx.destination);
      // 20 ms of noise, reused for the click transient.
      noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.02), ctx.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    } catch { return null; }
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

/** One bubble pop: the pitch drops fast from high to rest, a quiet octave above adds sparkle, a hint of click gives it snap. */
function pop(c: AudioContext, t: number, freq: number, level: number, tail = 0.11) {
  const out = master as GainNode;

  const body = c.createOscillator();
  const bg = c.createGain();
  body.type = 'sine';
  body.frequency.setValueAtTime(freq * 2.1, t);
  body.frequency.exponentialRampToValueAtTime(freq, t + 0.05);
  bg.gain.setValueAtTime(0.0001, t);
  bg.gain.exponentialRampToValueAtTime(level, t + 0.004);
  bg.gain.exponentialRampToValueAtTime(0.0001, t + tail);
  body.connect(bg).connect(out);
  body.start(t); body.stop(t + tail + 0.03);

  const spark = c.createOscillator();
  const sg = c.createGain();
  spark.type = 'sine';
  spark.frequency.setValueAtTime(freq * 4.2, t);
  spark.frequency.exponentialRampToValueAtTime(freq * 2, t + 0.04);
  sg.gain.setValueAtTime(0.0001, t);
  sg.gain.exponentialRampToValueAtTime(level * 0.22, t + 0.003);
  sg.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  spark.connect(sg).connect(out);
  spark.start(t); spark.stop(t + 0.07);

  if (noise) {
    const src = c.createBufferSource();
    const hp = c.createBiquadFilter();
    const ng = c.createGain();
    src.buffer = noise;
    hp.type = 'highpass'; hp.frequency.value = 2500;
    ng.gain.setValueAtTime(level * 0.16, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.014);
    src.connect(hp).connect(ng).connect(out);
    src.start(t);
  }
}

export type SoundKind = 'tap' | 'nav' | 'soft';

/** `step` gives each of the five bottom tabs its own pitch. */
export function playSound(kind: SoundKind = 'tap', step = 0) {
  if (!isSoundOn()) return;
  if (document.visibilityState === 'hidden') return;
  const c = audio();
  if (!c || !master) return;
  const t = c.currentTime + 0.005;
  if (kind === 'nav') {
    const notes = [440, 494, 554, 659, 740]; // gentle rising scale across the tabs
    pop(c, t, notes[Math.max(0, Math.min(4, step))], 0.16, 0.14);
  } else if (kind === 'soft') {
    pop(c, t, 330, 0.11, 0.1);
  } else {
    pop(c, t, 520, 0.14, 0.11);
  }
}

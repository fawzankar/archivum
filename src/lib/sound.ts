// Tiny synthesised tap sounds (Web Audio). No audio files, nothing to download, works offline.
const KEY = 'archivum-sound';
let ctx: AudioContext | null = null;

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
    try { ctx = new AC(); } catch { return null; }
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function blip(c: AudioContext, freq: number, start: number, dur: number, gain: number, type: OscillatorType = 'sine') {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.82, start + dur);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g).connect(c.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

export type SoundKind = 'tap' | 'nav' | 'soft';

/** `step` lets the five bottom tabs each have their own note. */
export function playSound(kind: SoundKind = 'tap', step = 0) {
  if (!isSoundOn()) return;
  if (document.visibilityState === 'hidden') return;
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  if (kind === 'nav') {
    const scale = [523.25, 587.33, 659.25, 783.99, 880]; // C D E G A: always sounds pleasant
    const f = scale[Math.max(0, Math.min(4, step))];
    blip(c, f, t, 0.16, 0.07);
    blip(c, f * 2, t + 0.012, 0.09, 0.025);
  } else if (kind === 'soft') {
    blip(c, 420, t, 0.09, 0.05);
  } else {
    blip(c, 720, t, 0.07, 0.06, 'triangle');
  }
}

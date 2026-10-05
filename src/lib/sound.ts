// Touch sound: plays the bundled "pop" mp3 (public/sounds/pop.mp3) through Web Audio for low latency.
const KEY = 'archivum-sound';
const SRC = '/sounds/pop.mp3';
let ctx: AudioContext | null = null;
let gain: GainNode | null = null;
let buffer: AudioBuffer | null = null;
let loading: Promise<void> | null = null;

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
      gain = ctx.createGain();
      gain.gain.value = 0.9;
      gain.connect(ctx.destination);
    } catch { return null; }
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function load(c: AudioContext): Promise<void> {
  if (buffer) return Promise.resolve();
  if (!loading) {
    loading = fetch(SRC)
      .then((r) => r.arrayBuffer())
      .then((data) => new Promise<void>((resolve, reject) => c.decodeAudioData(data, (b) => { buffer = b; resolve(); }, reject)))
      .catch(() => { loading = null; });
  }
  return loading;
}

export type SoundKind = 'tap' | 'nav' | 'soft';

/** Plays the pop sound. `kind` and `step` are kept so existing callers still work; every tap uses the same sound. */
export function playSound(_kind: SoundKind = 'tap', _step = 0) {
  if (!isSoundOn()) return;
  if (document.visibilityState === 'hidden') return;
  const c = audio();
  if (!c || !gain) return;
  const go = () => {
    if (!buffer || !gain) return;
    const src = c.createBufferSource();
    src.buffer = buffer;
    src.connect(gain);
    src.start();
  };
  if (buffer) go(); else load(c).then(go);
}

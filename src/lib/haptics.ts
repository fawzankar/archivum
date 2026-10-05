// Touch vibration. Android browsers use the Vibration API; iPhone Safari has no such API,
// so we fall back to the system "switch" tick (works on recent iOS, silently does nothing elsewhere).
const KEY = 'archivum-haptics';

export function isHapticsOn(): boolean {
  try { return localStorage.getItem(KEY) !== 'off'; } catch { return true; }
}
export function setHapticsOn(on: boolean) {
  try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch { /* storage blocked */ }
}

export type HapticKind = 'tap' | 'nav' | 'soft' | 'toggle';

// Short and light on purpose: long buzzes feel cheap, a crisp 8-14 ms tick feels premium.
const PATTERNS: Record<HapticKind, number | number[]> = {
  tap: 10,
  nav: [12, 22, 6],
  soft: 7,
  toggle: [8, 28, 14],
};

const isIOS = () => typeof navigator !== 'undefined' && (/iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

function iosTick() {
  try {
    const label = document.createElement('label');
    label.setAttribute('aria-hidden', 'true');
    label.className = 'ax-haptic-probe';
    label.style.cssText = 'position:fixed;left:-200px;top:-200px;width:1px;height:1px;opacity:0;pointer-events:none';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.setAttribute('switch', '');
    label.appendChild(input);
    document.body.appendChild(label);
    label.click();
    window.setTimeout(() => label.remove(), 80);
  } catch { /* not supported */ }
}

export function haptic(kind: HapticKind = 'tap') {
  if (typeof navigator === 'undefined' || !isHapticsOn()) return;
  if (typeof navigator.vibrate === 'function') { navigator.vibrate(PATTERNS[kind]); return; }
  if (isIOS()) iosTick();
}

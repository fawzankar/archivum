'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { useToast } from './ToastContext';
import './feedback.css';

// Chrome/Edge/Samsung Internet fire this before they offer installation.
interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
type InstallWindow = Window & { __axInstall?: InstallEvent };

const KEY = 'archivum_pwa_install';
const SNOOZE_MS = 3 * 24 * 60 * 60 * 1000;
const SHOW_DELAY_MS = 2500;

type Choice = { mode: 'never' } | { mode: 'later'; until: number };

function readChoice(): Choice | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Choice) : null;
  } catch {
    return null;
  }
}

function writeChoice(choice: Choice) {
  try { window.localStorage.setItem(KEY, JSON.stringify(choice)); } catch { /* storage unavailable */ }
}

function isSilenced() {
  const choice = readChoice();
  if (!choice) return false;
  return choice.mode === 'never' || choice.until > Date.now();
}

type Platform = 'ios' | 'android' | 'desktop';

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  return /android/i.test(ua) ? 'android' : 'desktop';
}

// Short, scannable version shown in the dialog.
const LATER_STEPS: Record<Platform, string> = {
  ios: 'Tap the Share button, then Add to Home Screen.',
  android: 'Tap the ⋮ (3 dots) menu, then Install app.',
  desktop: 'Click the install icon in the address bar, or open ⋮ and choose Install ARCHIVUM.',
};

const LATER_HINT: Record<Platform, string> = {
  ios: 'Tap the Share button, then choose Add to Home Screen.',
  android: 'Tap the ⋮ (3 dots) menu in your browser, then choose Install app.',
  desktop: 'Click the install icon in the address bar, or open the ⋮ menu and choose Install ARCHIVUM.',
};

type Phase = 'hidden' | 'card' | 'confirm';

export default function InstallPwaPrompt() {
  const { showToast } = useToast();
  const [phase, setPhase] = useState<Phase>('hidden');
  const [platform, setPlatform] = useState<Platform>('desktop');
  const installEvent = useRef<InstallEvent | null>(null);
  const laterButton = useRef<HTMLButtonElement>(null);
  const neverButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    window.localStorage.removeItem('archivum_pwa_dismissed'); // flag from the old one-click prompt
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) return;

    const detected = detectPlatform();
    setPlatform(detected);

    const root = document.documentElement;
    let timer: number | undefined;
    let shown = false;

    // Only offer once the splash and first-time onboarding are out of the way.
    const ready = () => !root.classList.contains('ax-booting') && !root.classList.contains('profile-onboarding-active');
    const canInstall = () => detected === 'ios' || installEvent.current !== null;

    const schedule = () => {
      window.clearTimeout(timer);
      if (shown || !ready() || !canInstall() || isSilenced()) return;
      timer = window.setTimeout(() => {
        if (shown || !ready() || isSilenced()) return;
        shown = true;
        setPhase('card');
      }, SHOW_DELAY_MS);
    };

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      installEvent.current = e as InstallEvent;
      schedule();
    };
    const onInstalled = () => {
      window.clearTimeout(timer);
      shown = true;
      installEvent.current = null;
      setPhase('hidden');
      try { window.localStorage.removeItem(KEY); } catch { /* ignore */ }
    };

    // The boot script may have caught the event before this component loaded.
    installEvent.current = (window as InstallWindow).__axInstall ?? null;
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    window.addEventListener('archivum:splash-done', schedule);
    const observer = new MutationObserver(schedule);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    schedule();

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
      window.removeEventListener('archivum:splash-done', schedule);
      observer.disconnect();
    };
  }, []);

  const snooze = useCallback(() => {
    writeChoice({ mode: 'later', until: Date.now() + SNOOZE_MS });
    setPhase('hidden');
  }, []);

  const never = () => {
    writeChoice({ mode: 'never' });
    setPhase('hidden');
    showToast(`Okay, we won't ask again. ${LATER_HINT[platform]}`, 'info');
  };

  const later = useCallback(() => {
    snooze();
    showToast(`No problem. To install later: ${LATER_HINT[platform]}`, 'info');
  }, [snooze, showToast, platform]);

  const install = async () => {
    const event = installEvent.current;
    if (platform === 'ios' || !event) { snooze(); return; }
    installEvent.current = null;
    (window as InstallWindow).__axInstall = undefined;
    try {
      await event.prompt();
      const { outcome } = await event.userChoice;
      if (outcome === 'accepted') setPhase('hidden'); else snooze();
    } catch {
      snooze();
    }
  };

  // Confirm dialog: Escape = remind me later; Tab stays inside the dialog.
  useEffect(() => {
    if (phase !== 'confirm') return;
    laterButton.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); later(); }
      if (e.key === 'Tab') {
        const first = laterButton.current;
        const last = neverButton.current;
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [phase, later]);

  if (phase === 'hidden') return null;
  const ios = platform === 'ios';

  return (
    <>
      <aside className="ax-install" aria-label="Install ARCHIVUM">
        <span className="ax-install__icon" aria-hidden="true"><span className="archivum-css-logo" /></span>
        <div className="ax-install__copy">
          <strong>Install ARCHIVUM</strong>
          <p>{ios ? 'Tap Share, then Add to Home Screen.' : 'Works offline, like an app.'}</p>
        </div>
        <button type="button" className="ax-install__go" onClick={install}>
          {ios ? <Share aria-hidden="true" /> : <Download aria-hidden="true" />}
          <span>{ios ? 'Got it' : 'Install'}</span>
        </button>
        <button type="button" className="ax-install__close" aria-label="Close install message" onClick={() => setPhase('confirm')}>
          <X aria-hidden="true" />
        </button>
      </aside>

      {phase === 'confirm' && (
        <div className="ax-install-scrim" onClick={later}>
          <div
            className="ax-install-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="ax-install-title"
            aria-describedby="ax-install-text"
            onClick={e => e.stopPropagation()}
          >
            <span className="ax-install-dialog__badge" aria-hidden="true"><Download /></span>
            <h2 id="ax-install-title">Never show this again?</h2>
            <p id="ax-install-text">Want to install later instead? You can do it any time from your browser.</p>
            <div className="ax-install-dialog__hint">
              <span className="ax-install-dialog__dots" aria-hidden="true">{ios ? <Share /> : '⋮'}</span>
              <span>{LATER_STEPS[platform]}</span>
            </div>
            <div className="ax-install-dialog__actions">
              <button ref={laterButton} type="button" className="ax-install-dialog__later" onClick={later}>Remind me later</button>
              <button ref={neverButton} type="button" className="ax-install-dialog__never" onClick={never}>Never show again</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

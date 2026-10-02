'use client';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { greetingForNow } from '@/lib/studyStats';

const SPLASH_MS = 3400;
const REDUCED_MS = 1100;
const LEAVE_MS = 520;
const SEEN_KEY = 'archivum_splash_seen';
const LETTERS = 'ARCHIVUM'.split('');

export default function SplashScreen() {
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [greeting, setGreeting] = useState('Welcome to the archive.');
  const [duration, setDuration] = useState(SPLASH_MS);
  const timers = useRef<number[]>([]);
  const closed = useRef(false);

  const close = useCallback(() => {
    if (closed.current) return;
    closed.current = true;
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    try { sessionStorage.setItem(SEEN_KEY, '1'); } catch {}
    setLeaving(true);
    window.setTimeout(() => {
      setShow(false);
      document.documentElement.classList.remove('archivum-booting');
    }, LEAVE_MS);
  }, []);

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem(SEEN_KEY) === '1'; } catch {}
    if (window.location.pathname !== '/' || seen) {
      document.documentElement.classList.remove('archivum-booting');
      return;
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const total = reduced ? REDUCED_MS : SPLASH_MS;
    setDuration(total);

    let first = '';
    try { first = (localStorage.getItem('archivum_display_name') || '').trim().split(/\s+/)[0]; } catch {}
    setGreeting(first ? `${greetingForNow()}, ${first}.` : 'Welcome to the archive.');

    document.documentElement.classList.add('archivum-booting');
    setShow(true);
    timers.current.push(window.setTimeout(close, total - LEAVE_MS));

    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') close(); };
    window.addEventListener('keydown', onKey);
    return () => {
      timers.current.forEach(window.clearTimeout);
      window.removeEventListener('keydown', onKey);
    };
  }, [close]);

  if (!show) return null;

  return (
    <div
      className={`boot-splash ax${leaving ? ' is-leaving' : ''}`}
      style={{ ['--ax-total' as string]: `${duration}ms` }}
      role="status"
      aria-label="Loading ARCHIVUM"
      onClick={close}
    >
      <span className="ax-glow ax-glow-a" aria-hidden="true" />
      <span className="ax-glow ax-glow-b" aria-hidden="true" />
      <span className="ax-grain" aria-hidden="true" />

      <button type="button" className="ax-skip" onClick={e => { e.stopPropagation(); close(); }}>Skip</button>

      <div className="ax-stage">
        <div className="ax-emblem" aria-hidden="true">
          <span className="ax-sheet ax-sheet-1" />
          <span className="ax-sheet ax-sheet-2" />
          <span className="ax-sheet ax-sheet-3" />
          <span className="ax-tile">
            <Image className="ax-logo" src="/archivum-logo-dark.png" alt="" width={72} height={72} priority />
          </span>
        </div>

        <h1 className="ax-word" aria-label="ARCHIVUM">
          {LETTERS.map((l, i) => <span key={i} aria-hidden="true" style={{ ['--i' as string]: i }}>{l}</span>)}
        </h1>

        <p className="ax-greet">{greeting}</p>
        <p className="ax-line">Notes, papers and study material, all in one place.</p>
      </div>

      <div className="ax-foot">
        <span className="ax-bar" aria-hidden="true"><i /></span>
        <span className="ax-credit">Made by Fawzan Kar</span>
      </div>
    </div>
  );
}

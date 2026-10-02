'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, BellOff, Pause, Play, RotateCcw, SkipForward } from 'lucide-react';
import { useToast } from '@/components/ToastContext';
import { loadStudy, recordFocus, todayStats, STUDY_EVENT } from '@/lib/studyStats';

type Mode = 'focus' | 'short' | 'long';

const MODES: Record<Mode, { label: string; hint: string }> = {
  focus: { label: 'Focus', hint: 'Phone down. One task. You’ve got this.' },
  short: { label: 'Short break', hint: 'Stand up, stretch, sip some water.' },
  long: { label: 'Long break', hint: 'You’ve earned this. Step away for a bit.' },
};
const FOCUS_CHOICES = [15, 25, 45, 60];
const BREAK_MIN: Record<'short' | 'long', number> = { short: 5, long: 15 };
const R = 118;
const C = 2 * Math.PI * R;

function chime() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    [660, 880, 1100].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.22;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.55);
    });
    window.setTimeout(() => ctx.close().catch(() => {}), 1500);
  } catch {}
}

export default function FocusClient() {
  const { showToast } = useToast();
  const [mode, setMode] = useState<Mode>('focus');
  const [focusMin, setFocusMin] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [rounds, setRounds] = useState(0);
  const [todayMin, setTodayMin] = useState(0);
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const endRef = useRef<number | null>(null);
  const startedRef = useRef<number | null>(null);
  const wakeRef = useRef<WakeLockSentinel | null>(null);

  const total = (mode === 'focus' ? focusMin : BREAK_MIN[mode]) * 60;

  const syncToday = useCallback(() => setTodayMin(todayStats(loadStudy()).focusMin), []);
  useEffect(() => {
    try { setAlarmEnabled(localStorage.getItem('archivum_focus_alarm') !== '0'); } catch {}
    syncToday();
    window.addEventListener(STUDY_EVENT, syncToday);
    return () => window.removeEventListener(STUDY_EVENT, syncToday);
  }, [syncToday]);

  const releaseWake = useCallback(() => {
    wakeRef.current?.release().catch(() => {});
    wakeRef.current = null;
  }, []);

  const acquireWake = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) wakeRef.current = await navigator.wakeLock.request('screen');
    } catch {}
  }, []);

  const bankElapsed = useCallback(() => {
    if (mode !== 'focus' || startedRef.current === null) return;
    const mins = Math.floor((Date.now() - startedRef.current) / 60000);
    if (mins >= 1) recordFocus(mins);
    startedRef.current = null;
  }, [mode]);

  const switchMode = useCallback((next: Mode, minutes?: number) => {
    setRunning(false);
    endRef.current = null;
    startedRef.current = null;
    releaseWake();
    setMode(next);
    const mins = next === 'focus' ? (minutes ?? focusMin) : BREAK_MIN[next];
    setRemaining(mins * 60);
  }, [focusMin, releaseWake]);

  const finish = useCallback(() => {
    setRunning(false);
    endRef.current = null;
    releaseWake();
    if (alarmEnabled) {
      chime();
      try { navigator.vibrate?.([180, 90, 180]); } catch {}
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(mode === 'focus' ? 'Focus session complete' : 'Break complete', {
            body: mode === 'focus' ? 'Nice work. Your break is ready.' : 'Ready for another focused round?',
            icon: '/archivum-icon.png',
          });
        }
      } catch {}
    }
    if (mode === 'focus') {
      recordFocus(focusMin);
      startedRef.current = null;
      const nextRounds = rounds + 1;
      setRounds(nextRounds);
      showToast(`Round done. ${focusMin} minutes in the bank.`, 'success');
      const next: Mode = nextRounds % 4 === 0 ? 'long' : 'short';
      setMode(next);
      setRemaining(BREAK_MIN[next] * 60);
    } else {
      showToast('Break’s over. Ready when you are.', 'info');
      setMode('focus');
      setRemaining(focusMin * 60);
    }
  }, [alarmEnabled, focusMin, mode, releaseWake, rounds, showToast]);

  // Timestamp-based so the clock stays honest even when the tab is in the background.
  useEffect(() => {
    if (!running) return;
    const tick = () => {
      if (endRef.current === null) return;
      const left = Math.max(0, Math.round((endRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) finish();
    };
    tick();
    const id = window.setInterval(tick, 250);
    const onVisible = () => { if (document.visibilityState === 'visible') { tick(); if (running) acquireWake(); } };
    document.addEventListener('visibilitychange', onVisible);
    return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', onVisible); };
  }, [running, finish, acquireWake]);

  useEffect(() => {
    const m = Math.floor(remaining / 60);
    const s = String(remaining % 60).padStart(2, '0');
    document.title = running ? `${m}:${s} · ${MODES[mode].label} | ARCHIVUM` : 'Focus timer | ARCHIVUM';
    return () => { document.title = 'ARCHIVUM | Academic Archive'; };
  }, [remaining, running, mode]);

  useEffect(() => () => releaseWake(), [releaseWake]);

  const start = () => {
    endRef.current = Date.now() + remaining * 1000;
    if (mode === 'focus' && startedRef.current === null) startedRef.current = Date.now();
    setRunning(true);
    acquireWake();
  };
  const pause = () => {
    setRunning(false);
    endRef.current = null;
    releaseWake();
  };
  const reset = () => {
    bankElapsed();
    switchMode(mode);
    syncToday();
  };
  const skip = () => {
    bankElapsed();
    if (mode === 'focus') switchMode(rounds > 0 && (rounds + 1) % 4 === 0 ? 'long' : 'short');
    else switchMode('focus');
  };
  const pickLength = (mins: number) => {
    if (running) return;
    setFocusMin(mins);
    if (mode === 'focus') setRemaining(mins * 60);
  };

  const progress = total ? 1 - remaining / total : 0;
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  return (
    <section className="fx" data-mode={mode} aria-label="Focus timer">
      <div className="fx-tabs" role="tablist" aria-label="Timer mode">
        {(Object.keys(MODES) as Mode[]).map(m => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} className={mode === m ? 'on' : ''} onClick={() => { bankElapsed(); switchMode(m); }}>
            {MODES[m].label}
          </button>
        ))}
      </div>

      <div className="fx-dial">
        <svg viewBox="0 0 260 260" aria-hidden="true">
          <circle className="fx-track" cx="130" cy="130" r={R} />
          <circle className="fx-bar" cx="130" cy="130" r={R} strokeDasharray={C} strokeDashoffset={C * (1 - progress)} transform="rotate(-90 130 130)" />
        </svg>
        <div className="fx-readout" role="timer" aria-live="off">
          <strong>{mm}:{ss}</strong>
          <span>{MODES[mode].hint}</span>
        </div>
      </div>

      <div className="fx-controls">
        <button type="button" className="fx-side" onClick={reset} aria-label="Reset timer"><RotateCcw /></button>
        <button type="button" className="fx-main" onClick={running ? pause : start}>
          {running ? <><Pause /> Pause</> : <><Play /> {remaining < total ? 'Resume' : 'Start'}</>}
        </button>
        <button type="button" className="fx-side" onClick={skip} aria-label="Skip to next"><SkipForward /></button>
      </div>

      <button
        type="button"
        className={`fx-alarm${alarmEnabled ? ' on' : ''}`}
        onClick={async () => {
          const next = !alarmEnabled;
          if (next && 'Notification' in window && Notification.permission === 'default') {
            try { await Notification.requestPermission(); } catch {}
          }
          setAlarmEnabled(next);
          try { localStorage.setItem('archivum_focus_alarm', next ? '1' : '0'); } catch {}
        }}
        aria-pressed={alarmEnabled}
      >
        {alarmEnabled ? <Bell /> : <BellOff />} {alarmEnabled ? 'Alarm on' : 'Alarm off'}
      </button>

      {mode === 'focus' && (
        <div className="fx-lengths" role="group" aria-label="Round length">
          {FOCUS_CHOICES.map(m => (
            <button key={m} type="button" className={focusMin === m ? 'on' : ''} disabled={running} onClick={() => pickLength(m)}>{m} min</button>
          ))}
        </div>
      )}

      <div className="fx-stats">
        <div><strong>{todayMin}</strong><span>minutes focused today</span></div>
        <div className="fx-pips" aria-label={`${rounds % 4} of 4 rounds before a long break`}>
          {[0, 1, 2, 3].map(i => <i key={i} className={i < rounds % 4 || (rounds > 0 && rounds % 4 === 0) ? 'on' : ''} />)}
          <span>{rounds} {rounds === 1 ? 'round' : 'rounds'} this visit</span>
        </div>
      </div>
    </section>
  );
}

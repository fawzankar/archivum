'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import './feedback.css';

type State = 'online' | 'offline' | 'restored';

// Shows "You're offline" the moment the connection drops while the app is open, and "Back online" when it returns.
export default function ConnectionStatus() {
  const [state, setState] = useState<State>('online');

  useEffect(() => {
    const root = document.documentElement;
    let timer: number | undefined;
    const goOffline = () => { window.clearTimeout(timer); root.classList.add('ax-offline'); setState('offline'); };
    const goOnline = () => {
      window.clearTimeout(timer);
      if (!root.classList.contains('ax-offline')) return;
      root.classList.remove('ax-offline');
      setState('restored');
      timer = window.setTimeout(() => setState('online'), 2600);
    };
    if (!navigator.onLine) goOffline();
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => { window.clearTimeout(timer); window.removeEventListener('offline', goOffline); window.removeEventListener('online', goOnline); root.classList.remove('ax-offline'); };
  }, []);

  if (state === 'online') return null;
  const offline = state === 'offline';
  return (
    <div className={'ax-conn ' + (offline ? 'ax-conn--off' : 'ax-conn--on')} role="status" aria-live="polite">
      {offline ? <WifiOff aria-hidden="true" /> : <Wifi aria-hidden="true" />}
      <span>{offline ? "You're offline" : 'Back online'}</span>
    </div>
  );
}

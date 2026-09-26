'use client';

import { useEffect } from 'react';

export default function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('SJS CONNECT PWA Service Worker registered:', reg.scope))
        .catch((err) => console.error('PWA SW registration failed:', err));
    }
  }, []);

  return null;
}

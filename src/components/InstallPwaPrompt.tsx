'use client';

import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('archivum_pwa_dismissed');
    if (dismissed) return;

    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    if (standalone) return;

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;
    setIos(isIOS);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    if (isIOS) {
      const timer = window.setTimeout(() => setShowPrompt(true), 1800);
      return () => { window.clearTimeout(timer); window.removeEventListener('beforeinstallprompt', handleBeforeInstall); };
    }
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (ios) {
      setShowPrompt(false);
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('archivum_pwa_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div
      className="fixed bottom-20 left-4 right-4 md:bottom-6 md:left-6 md:right-auto z-40 max-w-sm rounded-2xl border p-4 shadow-xl flex items-center justify-between gap-3 animate-fade"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-800">
          <Download className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-display text-xs sm:text-sm" style={{ color:'var(--ink)' }}>{ios ? 'Add ARCHIVUM to your Home Screen' : 'Take ARCHIVUM with you'}</h4>
          <p className="text-[11px]" style={{ color:'var(--ink-muted)' }}>{ios ? 'Share → Add to Home Screen for one-tap access.' : 'One tap from your home screen. Fast and offline-ready.'}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 text-xs font-semibold rounded-full text-white bg-zinc-900 hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          {ios ? 'Show me' : 'Add to device'}
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

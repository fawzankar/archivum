'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, X } from 'lucide-react';

export default function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('sjs_pwa_dismissed');
    if (dismissed) return;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
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
    localStorage.setItem('sjs_pwa_dismissed', 'true');
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
          <Smartphone className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-display font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
            Install ARCHIVUM
          </h4>
          <p className="text-[11px] text-zinc-500">Fast offline revision on your device.</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 text-xs font-semibold rounded-full text-white bg-zinc-900 hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          Install
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

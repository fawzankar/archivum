'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import './feedback.css';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  ms: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info } as const;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    // Longer messages stay a little longer so they can actually be read.
    const ms = Math.min(8000, Math.max(3500, message.length * 55));
    setToasts(prev => [...prev.slice(-2), { id, message, type, ms }]);
    window.setTimeout(() => removeToast(id), ms);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="ax-toasts" role="region" aria-label="Notifications" aria-live="polite">
        {toasts.map(toast => {
          const Icon = ICONS[toast.type];
          return (
            <div key={toast.id} className={`ax-toast ax-toast--${toast.type}`} style={{ ['--ax-toast-ms' as string]: `${toast.ms}ms` }}>
              <span className="ax-toast__icon" aria-hidden="true"><Icon /></span>
              <p className="ax-toast__msg">{toast.message}</p>
              <button type="button" className="ax-toast__close" aria-label="Dismiss" onClick={() => removeToast(toast.id)}>
                <X aria-hidden="true" />
              </button>
              <span className="ax-toast__bar" aria-hidden="true" />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

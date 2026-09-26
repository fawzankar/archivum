'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Mode = 'light' | 'dark';
export type Accent = 'default' | 'violet' | 'sky' | 'ocean' | 'rose';

export const ACCENTS: Array<{ id: Accent; label: string; color: string }> = [
  { id: 'default', label: 'Default Blue', color: '#2563eb' },
  { id: 'violet', label: 'Violet', color: '#7c3aed' },
  { id: 'sky', label: 'Light Blue', color: '#0ea5e9' },
  { id: 'ocean', label: 'Ocean', color: '#0891b2' },
  { id: 'rose', label: 'Rose', color: '#e11d48' },
];

interface ThemeContextType {
  mode: Mode;
  accent: Accent;
  setMode: (mode: Mode) => void;
  setAccent: (accent: Accent) => void;
  effectiveTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>('light');
  const [accent, setAccentState] = useState<Accent>('default');
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedMode = localStorage.getItem('sjs_theme_mode') as Mode | null;
    const savedAccent = localStorage.getItem('sjs_theme_accent') as Accent | null;
    if (savedMode === 'light' || savedMode === 'dark') setModeState(savedMode);
    if (savedAccent && ACCENTS.some((item) => item.id === savedAccent)) setAccentState(savedAccent);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', mode === 'dark');
    root.setAttribute('data-accent', accent);
    setEffectiveTheme(mode);
  }, [mode, accent]);

  const setMode = (newMode: Mode) => {
    setModeState(newMode);
    localStorage.setItem('sjs_theme_mode', newMode);
  };

  const setAccent = (newAccent: Accent) => {
    setAccentState(newAccent);
    localStorage.setItem('sjs_theme_accent', newAccent);
  };

  return (
    <ThemeContext.Provider value={{ mode, accent, setMode, setAccent, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}

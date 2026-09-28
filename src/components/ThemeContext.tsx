'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type Mode = 'light' | 'dark';
export type Accent = 'citrus' | 'red' | 'ocean' | 'pink';

export const ACCENTS: { id: Accent; label: string; color: string }[] = [
  { id: 'citrus', label: 'Citrus', color: '#c7a92b' },
  { id: 'red', label: 'Red', color: '#d64b52' },
  { id: 'ocean', label: 'Ocean', color: '#24779a' },
  { id: 'pink', label: 'Pink', color: '#d25588' },
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
  const [accent, setAccentState] = useState<Accent>('ocean');
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedMode = localStorage.getItem('archivum_theme_mode') as Mode | null;
    const savedAccent = localStorage.getItem('archivum_accent') as Accent | null;
    if (savedMode === 'light' || savedMode === 'dark') setModeState(savedMode);
    if (savedAccent && ACCENTS.some(item => item.id === savedAccent)) setAccentState(savedAccent);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
    document.documentElement.setAttribute('data-accent', accent);
    setEffectiveTheme(mode);
  }, [mode, accent]);

  const setMode = (next: Mode) => {
    setModeState(next);
    localStorage.setItem('archivum_theme_mode', next);
  };

  const setAccent = (next: Accent) => {
    setAccentState(next);
    localStorage.setItem('archivum_accent', next);
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

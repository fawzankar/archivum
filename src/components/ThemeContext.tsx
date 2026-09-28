'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type Accent = 'sapphire' | 'sage' | 'amethyst' | 'ash' | 'frost';
export const ACCENTS: { id: Accent; label: string; color: string }[] = [
  { id: 'sapphire', label: 'Sapphire', color: '#0474C4' },
  { id: 'sage', label: 'Sage', color: '#345C32' },
  { id: 'amethyst', label: 'Amethyst', color: '#472F5B' },
  { id: 'ash', label: 'Sapphire ash', color: '#35627A' },
  { id: 'frost', label: 'Frosted aura', color: '#5C7E8F' },
];
type ThemeMode = 'light' | 'dark';
interface ThemeContextType { accent: Accent; setAccent: (accent: Accent) => void; mode: ThemeMode; setMode: (mode: ThemeMode) => void; }
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = useState<Accent>('sapphire');
  const [mode, setModeState] = useState<ThemeMode>('light');
  useEffect(() => {
    const savedAccent = localStorage.getItem('archivum_accent') as Accent | null;
    const savedMode = localStorage.getItem('archivum_theme') as ThemeMode | null;
    if (savedAccent && ACCENTS.some(item => item.id === savedAccent)) setAccentState(savedAccent);
    if (savedMode === 'dark' || savedMode === 'light') setModeState(savedMode);
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-accent', accent);
    root.classList.toggle('dark', mode === 'dark');
    root.style.colorScheme = mode;
  }, [accent, mode]);
  const setAccent = (next: Accent) => { setAccentState(next); localStorage.setItem('archivum_accent', next); };
  const setMode = (next: ThemeMode) => { setModeState(next); localStorage.setItem('archivum_theme', next); };
  return <ThemeContext.Provider value={{ accent, setAccent, mode, setMode }}>{children}</ThemeContext.Provider>;
}
export function useTheme() { const context = useContext(ThemeContext); if (!context) throw new Error('useTheme must be used within ThemeProvider'); return context; }

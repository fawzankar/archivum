'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type Accent = 'indigo' | 'forest' | 'tangerine' | 'berry' | 'ocean';
export const ACCENTS: { id: Accent; label: string; color: string }[] = [
  { id: 'indigo', label: 'Indigo', color: '#1b2166' },
  { id: 'forest', label: 'Forest', color: '#0f4d2e' },
  { id: 'tangerine', label: 'Tangerine', color: '#c2410c' },
  { id: 'berry', label: 'Berry', color: '#7a1258' },
  { id: 'ocean', label: 'Ocean', color: '#06506b' },
];
type ThemeMode = 'light';
interface ThemeContextType { accent: Accent; setAccent: (accent: Accent) => void; mode: ThemeMode; setMode: (mode: ThemeMode) => void; }
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = useState<Accent>('indigo');
  useEffect(() => {
    const saved = localStorage.getItem('archivum_accent') as Accent | null;
    if (saved && ACCENTS.some(item => item.id === saved)) setAccentState(saved);
    document.documentElement.classList.remove('dark');
  }, []);
  useEffect(() => { document.documentElement.setAttribute('data-accent', accent); }, [accent]);
  const setAccent = (next: Accent) => { setAccentState(next); localStorage.setItem('archivum_accent', next); };
  return <ThemeContext.Provider value={{ accent, setAccent, mode: 'light', setMode: () => {} }}>{children}</ThemeContext.Provider>;
}
export function useTheme() { const context = useContext(ThemeContext); if (!context) throw new Error('useTheme must be used within ThemeProvider'); return context; }

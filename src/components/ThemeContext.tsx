'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type Accent = 'indigo' | 'forest' | 'golden-taupe' | 'cherry-blossom' | 'ocean';
export const ACCENTS: { id: Accent; label: string; color: string }[] = [
  { id: 'indigo', label: 'Indigo', color: '#1b2166' },
  { id: 'forest', label: 'Forest', color: '#0f4d2e' },
  { id: 'golden-taupe', label: 'Golden Taupe', color: '#D4AF37' },
  { id: 'cherry-blossom', label: 'Cherry Blossom', color: '#FFB7C5' },
  { id: 'ocean', label: 'Ocean', color: '#06506b' },
];
type ThemeMode = 'light';
interface ThemeContextType { accent: Accent; setAccent: (accent: Accent) => void; mode: ThemeMode; setMode: (mode: ThemeMode) => void; }
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = useState<Accent>('indigo');
  useEffect(() => {
    const saved = localStorage.getItem('archivum_accent');
    const migrated = saved === 'tangerine' || saved === 'ink-wash' ? 'golden-taupe' : saved === 'berry' ? 'cherry-blossom' : saved;
    if (migrated && ACCENTS.some(item => item.id === migrated)) {
      setAccentState(migrated as Accent);
      if (saved === 'tangerine' || saved === 'ink-wash') localStorage.setItem('archivum_accent', 'golden-taupe');
      if (saved === 'berry') localStorage.setItem('archivum_accent', 'cherry-blossom');
    }
    document.documentElement.classList.remove('dark');
  }, []);
  useEffect(() => { document.documentElement.setAttribute('data-accent', accent); }, [accent]);
  const setAccent = (next: Accent) => { setAccentState(next); localStorage.setItem('archivum_accent', next); };
  return <ThemeContext.Provider value={{ accent, setAccent, mode: 'light', setMode: () => {} }}>{children}</ThemeContext.Provider>;
}
export function useTheme() { const context = useContext(ThemeContext); if (!context) throw new Error('useTheme must be used within ThemeProvider'); return context; }

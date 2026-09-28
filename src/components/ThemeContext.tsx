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
interface ThemeContextType { accent: Accent; setAccent: (accent: Accent) => void; }
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = useState<Accent>('sapphire');
  useEffect(() => {
    const saved = localStorage.getItem('archivum_accent') as Accent | null;
    if (saved && ACCENTS.some(item => item.id === saved)) setAccentState(saved);
    document.documentElement.classList.remove('dark');
  }, []);
  useEffect(() => { document.documentElement.classList.remove('dark'); document.documentElement.setAttribute('data-accent', accent); }, [accent]);
  const setAccent = (next: Accent) => { setAccentState(next); localStorage.setItem('archivum_accent', next); };
  return <ThemeContext.Provider value={{ accent, setAccent }}>{children}</ThemeContext.Provider>;
}
export function useTheme() { const context = useContext(ThemeContext); if (!context) throw new Error('useTheme must be used within ThemeProvider'); return context; }

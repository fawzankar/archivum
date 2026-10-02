'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type Accent = 'indigo' | 'forest' | 'smoky-ink' | 'soft-pink' | 'crimson-veil';
export const ACCENTS: { id: Accent; label: string; color: string; image?: string }[] = [
  { id: 'indigo', label: 'Indigo', color: '#1b2166' },
  { id: 'forest', label: 'Forest', color: '#0f4d2e' },
  { id: 'smoky-ink', label: 'Smoky Ink', color: '#202329' },
  { id: 'soft-pink', label: 'Soft Pink', color: '#D46C8C' },
  { id: 'crimson-veil', label: 'Crimson Veil', color: '#610027', image: '/crimson-veil-theme.jpg' },
];
type ThemeMode = 'light';
interface ThemeContextType { accent: Accent; setAccent: (accent: Accent) => void; mode: ThemeMode; setMode: (mode: ThemeMode) => void; }
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
function migrateAccent(saved: string | null): Accent | null {
  if (!saved) return null;
  if (saved === 'tangerine' || saved === 'ink-wash' || saved === 'golden-taupe' || saved === 'smoky-olive') return 'smoky-ink';
  if (saved === 'berry' || saved === 'cherry-blossom') return 'soft-pink';
  if (saved === 'ocean') return 'crimson-veil';
  if (['indigo', 'forest', 'smoky-ink', 'soft-pink', 'crimson-veil'].includes(saved)) return saved as Accent;
  return null;
}
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = useState<Accent>('indigo');
  useEffect(() => {
    const saved = localStorage.getItem('archivum_accent');
    const migrated = migrateAccent(saved);
    if (migrated) {
      setAccentState(migrated);
      if (saved !== migrated) localStorage.setItem('archivum_accent', migrated);
    }
    document.documentElement.classList.remove('dark');
  }, []);
  useEffect(() => { document.documentElement.setAttribute('data-accent', accent); }, [accent]);
  const setAccent = (next: Accent) => { setAccentState(next); localStorage.setItem('archivum_accent', next); };
  return <ThemeContext.Provider value={{ accent, setAccent, mode: 'light', setMode: () => {} }}>{children}</ThemeContext.Provider>;
}
export function useTheme() { const context = useContext(ThemeContext); if (!context) throw new Error('useTheme must be used within ThemeProvider'); return context; }

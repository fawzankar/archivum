'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type Accent = 'indigo' | 'forest' | 'smoky-olive' | 'smoky-ink' | 'soft-pink' | 'crimson-veil';
export const ACCENTS: { id: Accent; label: string; color: string }[] = [
  { id: 'indigo', label: 'Indigo', color: '#1b2166' },
  { id: 'forest', label: 'Forest', color: '#0f4d2e' },
  { id: 'smoky-olive', label: 'Smoky Olive', color: '#565449' },
  { id: 'smoky-ink', label: 'Smoky Ink', color: '#202329' },
  { id: 'soft-pink', label: 'Soft Pink', color: '#D46C8C' },
  { id: 'crimson-veil', label: 'Velvet Ember', color: '#610027' },
];
type ThemeMode = 'light' | 'dark';
interface ThemeContextType { accent: Accent; setAccent: (accent: Accent) => void; mode: ThemeMode; setMode: (mode: ThemeMode) => void; }
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
function migrateAccent(saved: string | null): Accent | null {
  if (!saved) return null;
  if (saved === 'tangerine' || saved === 'ink-wash' || saved === 'golden-taupe') return 'smoky-ink';
  if (saved === 'berry' || saved === 'cherry-blossom') return 'soft-pink';
  if (saved === 'ocean') return 'crimson-veil';
  if (['indigo', 'forest', 'smoky-olive', 'smoky-ink', 'soft-pink', 'crimson-veil'].includes(saved)) return saved as Accent;
  return null;
}
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = useState<Accent>('indigo');
  const [accentInitialized, setAccentInitialized] = useState(false);
  const [mode, setModeState] = useState<ThemeMode>('light');
  useEffect(() => {
    const saved = localStorage.getItem('archivum_accent');
    const migrated = migrateAccent(saved);
    if (migrated) {
      setAccentState(migrated);
      if (saved !== migrated) localStorage.setItem('archivum_accent', migrated);
    }
    setAccentInitialized(true);
    let savedMode: string | null = null;
    try { savedMode = localStorage.getItem('archivum_theme'); } catch {}
    const initial: ThemeMode = savedMode === 'dark' ? 'dark' : 'light';
    setModeState(initial);
    document.documentElement.classList.toggle('dark', initial === 'dark');
  }, []);
  useEffect(() => {
    if (accentInitialized) document.documentElement.setAttribute('data-accent', accent);
  }, [accent, accentInitialized]);
  const setAccent = (next: Accent) => {
    document.documentElement.setAttribute('data-accent', next);
    setAccentState(next);
    localStorage.setItem('archivum_accent', next);
  };
  const setMode = (next: ThemeMode) => {
    document.documentElement.classList.toggle('dark', next === 'dark');
    setModeState(next);
    try { localStorage.setItem('archivum_theme', next); } catch {}
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'dark' ? '#0f1419' : '#e4ecff');
  };
  return <ThemeContext.Provider value={{ accent, setAccent, mode, setMode }}>{children}</ThemeContext.Provider>;
}
export function useTheme() { const context = useContext(ThemeContext); if (!context) throw new Error('useTheme must be used within ThemeProvider'); return context; }

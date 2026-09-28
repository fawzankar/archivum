'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
export type Mode = 'light' | 'dark';
export type Accent = 'mono';
export const ACCENTS = [{ id:'mono' as const, label:'Archive', color:'#9a4b36' }];
interface ThemeContextType { mode:Mode; accent:Accent; setMode:(mode:Mode)=>void; setAccent:(accent:Accent)=>void; effectiveTheme:'light'|'dark'; }
const ThemeContext=createContext<ThemeContextType|undefined>(undefined);
export function ThemeProvider({children}:{children:React.ReactNode}){
 const [mode,setModeState]=useState<Mode>('light'); const [effectiveTheme,setEffectiveTheme]=useState<'light'|'dark'>('light');
 useEffect(()=>{const saved=localStorage.getItem('archivum_theme_mode') as Mode|null;if(saved==='light'||saved==='dark')setModeState(saved)},[]);
 useEffect(()=>{document.documentElement.classList.toggle('dark',mode==='dark');document.documentElement.setAttribute('data-accent','mono');setEffectiveTheme(mode)},[mode]);
 const setMode=(m:Mode)=>{setModeState(m);localStorage.setItem('archivum_theme_mode',m)}; const setAccent=()=>{};
 return <ThemeContext.Provider value={{mode,accent:'mono',setMode,setAccent,effectiveTheme}}>{children}</ThemeContext.Provider>;
}
export function useTheme(){const context=useContext(ThemeContext);if(!context)throw new Error('useTheme must be used within ThemeProvider');return context;}

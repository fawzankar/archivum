'use client';
import React,{createContext,useContext,useEffect,useState} from 'react';
export type Accent='sapphire'|'sage'|'amethyst'|'ash'|'frost';
export const ACCENTS=[
  {id:'sapphire',label:'Sky',color:'#a9c8e8'},
  {id:'sage',label:'Mint',color:'#9fcdbb'},
  {id:'amethyst',label:'Lilac',color:'#b8b1df'},
  {id:'ash',label:'Butter',color:'#f5c95f'},
  {id:'frost',label:'Coral',color:'#ef9a86'},
] as const;
type Ctx={accent:Accent;setAccent:(a:Accent)=>void;mode:'light';setMode:(m:'light')=>void};
const ThemeContext=createContext<Ctx|undefined>(undefined);
export function ThemeProvider({children}:{children:React.ReactNode}){
  const [accent,setAccentState]=useState<Accent>('sapphire');
  useEffect(()=>{
    try{const a=localStorage.getItem('archivum_accent') as Accent|null;if(a&&ACCENTS.some(x=>x.id===a))setAccentState(a);document.documentElement.classList.remove('dark');document.documentElement.setAttribute('data-accent',a||'sapphire')}catch{}
  },[]);
  useEffect(()=>{document.documentElement.classList.remove('dark');document.documentElement.setAttribute('data-accent',accent);try{localStorage.setItem('archivum_accent',accent)}catch{}},[accent]);
  const value:Ctx={accent,setAccent:(a)=>setAccentState(a),mode:'light',setMode:()=>{}};
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useTheme(){const c=useContext(ThemeContext);if(!c)throw new Error('useTheme must be used within ThemeProvider');return c}

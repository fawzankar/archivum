use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Plus, FileText, Lightbulb } from 'lucide-react';
import { useStudentClass } from './StudentClassContext';

export default function MobileNav(){
 const pathname=usePathname(); const {studentClass}=useStudentClass();
 const href=(base:string)=>studentClass?`${base}?class=${studentClass}`:base;
 const navs=[['Home','/',Home],['Notes','/notes',BookOpen],['Upload','/upload',Plus],['Papers','/previous-papers',FileText],['Tips','/tips',Lightbulb]] as const;
 return <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t" style={{background:'var(--surface)',borderColor:'var(--border)',paddingBottom:'env(safe-area-inset-bottom,0px)'}}>
   <div className="max-w-md mx-auto h-[62px] flex items-center justify-around">
    {navs.map(([label,base,Icon])=>{const active=base==='/'?pathname==='/':pathname.startsWith(base); if(label==='Upload') return <Link key={base} href={href(base)} className="flex items-center justify-center w-11 h-11 -mt-5 border" style={{background:'var(--accent)',borderColor:'var(--accent)',color:'var(--accent-contrast)'}} aria-label="Upload"><Icon className="w-5 h-5"/></Link>;
    return <Link key={base} href={href(base)} className="w-14 h-full flex flex-col items-center justify-center gap-1" style={{color:active?'var(--accent)':'var(--ink-faint)'}}><Icon className="w-[18px] h-[18px]" strokeWidth={active?2.4:1.8}/><span className="text-[9px] font-semibold">{label}</span></Link>})}
   </div>
 </nav>;
}

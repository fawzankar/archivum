'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Plus, FileText, Lightbulb } from 'lucide-react';
import { useStudentClass } from './StudentClassContext';

export default function MobileNav(){
 const pathname=usePathname(); const {studentClass}=useStudentClass();
 const href=(base:string)=>studentClass?`${base}?class=${studentClass}`:base;
 const navs=[{label:'Home',href:'/',icon:Home},{label:'Notes',href:'/notes',icon:BookOpen},{label:'Upload',href:'/upload',icon:Plus,isAction:true},{label:'Papers',href:'/previous-papers',icon:FileText},{label:'Tips',href:'/tips',icon:Lightbulb}];
 return <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t" style={{minHeight:70,background:'var(--surface)',borderColor:'var(--border)',paddingBottom:'env(safe-area-inset-bottom,0px)'}}><div className="flex items-center justify-around h-[70px] px-1 max-w-lg mx-auto">{navs.map(item=>{const Icon=item.icon;const active=item.href==='/'?pathname==='/':pathname.startsWith(item.href);if(item.isAction)return <Link key={item.href} href={href(item.href)} className="flex flex-col items-center justify-center -mt-5" aria-label="Upload resource"><div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border" style={{background:'var(--accent)',borderColor:'var(--accent)',color:'var(--accent-contrast)'}}><Icon className="w-6 h-6"/></div><span className="text-[9px] font-bold mt-1" style={{color:'var(--ink)'}}>Upload</span></Link>;return <Link key={item.href} href={href(item.href)} className="flex flex-col items-center justify-center gap-1 w-14 h-full" style={{color:active?'var(--accent)':'var(--ink-muted)'}}><Icon className="w-[19px] h-[19px]" strokeWidth={active?2.5:1.8}/><span className="text-[9px] leading-none font-semibold">{item.label}</span></Link>})}</div></nav>
}

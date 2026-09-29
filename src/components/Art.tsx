import React from 'react';

/* Flat object illustrations: no people, no animals. */
const N = '#1b2166', W = '#ffffff', Y = '#ffc75f', P = '#8d9bff', K = '#ffbdde', G = '#2fb36d', S = '#5ec4f5';

const art: Record<string, React.ReactNode> = {
  Maths: <>
    <path d="M18 98 L62 22 L106 98 Z" fill={W} stroke={N} strokeWidth="4" strokeLinejoin="round"/>
    <path d="M62 44 L88 90 H36 Z" fill={Y}/>
    <circle cx="62" cy="34" r="5" fill={N}/>
    <rect x="12" y="102" width="98" height="10" rx="3" fill={S} stroke={N} strokeWidth="3"/>
    <path d="M28 102v6M44 102v6M60 102v6M76 102v6M92 102v6" stroke={N} strokeWidth="2.5"/>
  </>,
  Science: <>
    <path d="M46 14h28v30l26 48a10 10 0 0 1-9 15H29a10 10 0 0 1-9-15l26-48Z" fill={W} stroke={N} strokeWidth="4" strokeLinejoin="round"/>
    <path d="M32 78h56l12 22a6 6 0 0 1-5 9H25a6 6 0 0 1-5-9Z" fill={G}/>
    <circle cx="56" cy="92" r="5" fill={W}/><circle cx="76" cy="86" r="3.5" fill={W}/>
    <rect x="42" y="10" width="36" height="8" rx="4" fill={Y} stroke={N} strokeWidth="3"/>
  </>,
  SST: <>
    <circle cx="60" cy="56" r="42" fill={S} stroke={N} strokeWidth="4"/>
    <path d="M34 36c10-4 18 2 16 12s-12 10-14 20-12 8-14-4c-1-10 2-24 12-28ZM70 66c10-6 24 0 22 12s-10 16-20 12-8-18-2-24Z" fill={G}/>
    <path d="M60 14v84" stroke={N} strokeWidth="3" strokeDasharray="2 6" strokeLinecap="round"/>
    <path d="M40 104h40M60 98v6" stroke={N} strokeWidth="5" strokeLinecap="round"/>
  </>,
  English: <>
    <rect x="16" y="14" width="88" height="92" rx="14" fill={W} stroke={N} strokeWidth="4"/>
    <text x="60" y="83" textAnchor="middle" fontFamily="Georgia, serif" fontSize="62" fontWeight="700" fill={N}>A</text>
    <path d="M30 94h60" stroke={Y} strokeWidth="7" strokeLinecap="round"/>
  </>,
  Hindi: <>
    <rect x="16" y="14" width="88" height="92" rx="14" fill={Y} stroke={N} strokeWidth="4"/>
    <text x="60" y="82" textAnchor="middle" fontFamily="Noto Sans Devanagari, sans-serif" fontSize="58" fontWeight="700" fill={N}>अ</text>
    <path d="M30 96h60" stroke={P} strokeWidth="7" strokeLinecap="round"/>
  </>,
  Urdu: <>
    <rect x="16" y="14" width="88" height="92" rx="14" fill={P} stroke={N} strokeWidth="4"/>
    <text x="60" y="81" textAnchor="middle" direction="rtl" fontFamily="Noto Nastaliq Urdu, Noto Naskh Arabic, serif" fontSize="52" fontWeight="700" fill={N}>ا</text>
    <path d="M30 96h60" stroke={W} strokeWidth="7" strokeLinecap="round"/>
  </>,
  Biology: <>
    <path d="M60 106C24 100 14 62 26 30c34 4 52 26 34 76Z" fill={G} stroke={N} strokeWidth="4" strokeLinejoin="round"/>
    <path d="M60 106C64 76 46 52 30 38" stroke={N} strokeWidth="3.5" fill="none" strokeLinecap="round"/>
    <circle cx="92" cy="40" r="20" fill={K} stroke={N} strokeWidth="4"/><circle cx="92" cy="40" r="7" fill={N}/>
  </>,
  Physics: <>
    <ellipse cx="60" cy="60" rx="50" ry="20" fill="none" stroke={N} strokeWidth="4"/>
    <ellipse cx="60" cy="60" rx="50" ry="20" transform="rotate(60 60 60)" fill="none" stroke={N} strokeWidth="4"/>
    <ellipse cx="60" cy="60" rx="50" ry="20" transform="rotate(120 60 60)" fill="none" stroke={N} strokeWidth="4"/>
    <circle cx="60" cy="60" r="12" fill={Y} stroke={N} strokeWidth="4"/>
    <circle cx="106" cy="52" r="6" fill={K} stroke={N} strokeWidth="3"/><circle cx="30" cy="36" r="6" fill={S} stroke={N} strokeWidth="3"/>
  </>,
  Chemistry: <>
    <path d="M22 18h60v14L74 34v52a20 20 0 0 1-20 20h-4a20 20 0 0 1-20-20V34l-8-2Z" fill={W} stroke={N} strokeWidth="4" strokeLinejoin="round"/>
    <path d="M30 62h44v24a20 20 0 0 1-20 20h-4a20 20 0 0 1-20-20Z" fill={P}/>
    <circle cx="96" cy="30" r="8" fill={K} stroke={N} strokeWidth="3"/><circle cx="104" cy="52" r="5" fill={Y} stroke={N} strokeWidth="3"/>
  </>,
  notes: <>
    <rect x="22" y="12" width="70" height="96" rx="8" fill={W} stroke={N} strokeWidth="4"/>
    <path d="M22 30h70" stroke={N} strokeWidth="4"/><circle cx="38" cy="21" r="3" fill={N}/><circle cx="57" cy="21" r="3" fill={N}/><circle cx="76" cy="21" r="3" fill={N}/>
    <path d="M36 50h42M36 64h42M36 78h26" stroke={P} strokeWidth="5" strokeLinecap="round"/>
    <path d="M92 74l12-40 10 4-12 40-12 8Z" fill={K} stroke={N} strokeWidth="3.5" strokeLinejoin="round"/>
  </>,
  papers: <>
    <rect x="34" y="8" width="66" height="88" rx="8" fill={Y} stroke={N} strokeWidth="4" transform="rotate(8 67 52)"/>
    <rect x="16" y="18" width="66" height="88" rx="8" fill={W} stroke={N} strokeWidth="4"/>
    <path d="M30 42h38M30 56h38M30 70h24" stroke={N} strokeWidth="4" strokeLinecap="round"/>
    <circle cx="66" cy="88" r="12" fill={G} stroke={N} strokeWidth="3.5"/><path d="M60 88l4 4 8-8" stroke={W} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </>,
  default: <>
    <rect x="14" y="70" width="92" height="20" rx="4" fill={P} stroke={N} strokeWidth="4"/>
    <rect x="22" y="48" width="80" height="22" rx="4" fill={Y} stroke={N} strokeWidth="4"/>
    <rect x="18" y="26" width="84" height="22" rx="4" fill={K} stroke={N} strokeWidth="4"/>
  </>,
};

export default function Art({ name, className = '' }: { name: string; className?: string }) {
  const raw = (name || '').trim();
  const aliases: Record<string,string> = {
    maths:'Maths', mathematics:'Maths', math:'Maths',
    science:'Science', sst:'SST', socialscience:'SST', 'social science':'SST',
    english:'English', hindi:'Hindi', urdu:'Urdu', biology:'Biology', physics:'Physics', chemistry:'Chemistry',
    notes:'notes', paper:'papers', papers:'papers', 'previous year paper':'papers', 'previous papers':'papers'
  };
  const key = aliases[raw.toLowerCase()] || raw;
  return <svg className={`art ${className}`} viewBox="0 0 120 120" role="img" aria-hidden="true" focusable="false">{art[key] || art.default}</svg>;
}


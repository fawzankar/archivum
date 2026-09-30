import React from 'react';

/* Flat object illustrations: no people, no animals. */
const N = '#1b2166', W = '#ffffff', Y = '#ffc75f', P = '#8d9bff', K = '#ffbdde', G = '#2fb36d', S = '#5ec4f5';

const art: Record<string, React.ReactNode> = {
  Maths: <>
    <circle cx="60" cy="60" r="43" fill={W} stroke={N} strokeWidth="4"/>
    <text x="60" y="79" textAnchor="middle" fontFamily="Lato, Arial, sans-serif" fontSize="68" fontWeight="700" fontStyle="italic" fill={N}>π</text>
    <path d="M28 93h64" stroke={S} strokeWidth="7" strokeLinecap="round"/>
  </>,
  Science: <>
    <path d="M46 13h28v31l22 43a12 12 0 0 1-11 17H35a12 12 0 0 1-11-17l22-43Z" fill={W} stroke={N} strokeWidth="4" strokeLinejoin="round"/>
    <path d="M30 76c9-4 18 2 27-1 10-4 18-4 31 1l8 15a8 8 0 0 1-8 13H32a8 8 0 0 1-8-13Z" fill={G}/>
    <path d="M35 78c8-3 15 2 23 0 9-3 17-4 25 0" fill="none" stroke={S} strokeWidth="3.5" strokeLinecap="round"/>
    <circle cx="53" cy="91" r="4" fill={W}/><circle cx="74" cy="87" r="3" fill={W}/>
    <rect x="42" y="9" width="36" height="8" rx="4" fill={Y} stroke={N} strokeWidth="3"/>
  </>,
  SST: <>
    <circle cx="60" cy="58" r="42" fill={S} stroke={N} strokeWidth="4"/>
    <path d="M34 37c9-5 18-1 20 7 2 9-7 13-10 20-4 8-13 6-17-2-4-9-2-19 7-25ZM73 64c10-5 21 1 21 10 0 9-9 16-18 14-8-2-12-14-3-24Z" fill={G}/>
    <path d="M31 58c11-4 20-3 30 2 10 5 18 5 29 0" fill="none" stroke={N} strokeWidth="3" strokeLinecap="round"/>
    <path d="M60 16c-6 13-7 27-6 42 1 16 1 31-6 45M60 16c6 13 7 27 6 42-1 16-1 31 6 45" fill="none" stroke={N} strokeWidth="2.5" strokeDasharray="4 4"/>
    <path d="M42 103h36" stroke={N} strokeWidth="5" strokeLinecap="round"/>
  </>,
  English: <>
    <rect x="16" y="14" width="88" height="92" rx="14" fill={W} stroke={N} strokeWidth="4"/>
    <text x="60" y="83" textAnchor="middle" fontFamily="Lato, Arial, sans-serif" fontSize="62" fontWeight="700" fill={N}>A</text>
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
    <path d="M35 18C92 30 92 90 35 102" fill="none" stroke={N} strokeWidth="5" strokeLinecap="round"/>
    <path d="M85 18C28 30 28 90 85 102" fill="none" stroke={N} strokeWidth="5" strokeLinecap="round"/>
    <path d="M44 27h32M37 41h46M36 56h48M38 72h44M45 88h30" stroke={G} strokeWidth="6" strokeLinecap="round"/>
    <circle cx="35" cy="18" r="6" fill={S} stroke={N} strokeWidth="3"/><circle cx="85" cy="18" r="6" fill={K} stroke={N} strokeWidth="3"/>
    <circle cx="35" cy="102" r="6" fill={K} stroke={N} strokeWidth="3"/><circle cx="85" cy="102" r="6" fill={S} stroke={N} strokeWidth="3"/>
  </>,
  Physics: <>
    <ellipse cx="60" cy="60" rx="50" ry="20" fill="none" stroke={N} strokeWidth="4"/>
    <ellipse cx="60" cy="60" rx="50" ry="20" transform="rotate(60 60 60)" fill="none" stroke={N} strokeWidth="4"/>
    <ellipse cx="60" cy="60" rx="50" ry="20" transform="rotate(120 60 60)" fill="none" stroke={N} strokeWidth="4"/>
    <circle cx="60" cy="60" r="12" fill={Y} stroke={N} strokeWidth="4"/>
    <circle cx="106" cy="52" r="6" fill={K} stroke={N} strokeWidth="3"/><circle cx="30" cy="36" r="6" fill={S} stroke={N} strokeWidth="3"/>
  </>,
  Chemistry: <>
    <path d="M45 12h30v25l13 49a14 14 0 0 1-14 18H46a14 14 0 0 1-14-18l13-49Z" fill={W} stroke={N} strokeWidth="4" strokeLinejoin="round"/>
    <path d="M36 64h48l6 22a13 13 0 0 1-13 16H43a13 13 0 0 1-13-16Z" fill={P} className="chem-liquid"/>
    <path d="M39 72c8-5 14 5 21 0s13-5 21 0" fill="none" stroke={S} strokeWidth="3" strokeLinecap="round" className="chem-liquid-line"/>
    <rect x="41" y="8" width="38" height="8" rx="4" fill={Y} stroke={N} strokeWidth="3"/>
    <circle cx="92" cy="34" r="7" fill={K} stroke={N} strokeWidth="3"/><circle cx="101" cy="52" r="4" fill={Y} stroke={N} strokeWidth="2.5"/>
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


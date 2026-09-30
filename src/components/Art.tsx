import React from 'react';

/* Flat academic illustrations. Kept intentionally simple and consistent across cards. */
const N = '#1b2166', W = '#ffffff', Y = '#ffc75f', P = '#8d9bff', K = '#ffbdde', G = '#2fb36d', S = '#5ec4f5';

const art: Record<string, React.ReactNode> = {
  Maths: <>
    <circle cx="60" cy="58" r="42" fill={W} stroke={N} strokeWidth="4"/>
    <text x="60" y="78" textAnchor="middle" fontFamily="Lato, Arial, sans-serif" fontSize="64" fontWeight="700" fontStyle="italic" fill={N}>π</text>
    <path d="M31 94h58" stroke={S} strokeWidth="7" strokeLinecap="round"/>
  </>,

  Science: <>
    <path d="M47 12h26v29l22 45c4 9-3 18-13 18H38c-10 0-17-9-13-18l22-45Z"
      fill={W} stroke={N} strokeWidth="4" strokeLinejoin="round"/>
    <path d="M30 75h60l7 15c2 7-3 14-11 14H34c-8 0-13-7-11-14Z"
      fill={G} stroke={N} strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M31 76h58" fill="none" stroke={S} strokeWidth="3.5" strokeLinecap="round"/>
    <circle cx="50" cy="91" r="4" fill={W}/>
    <circle cx="72" cy="87" r="3.5" fill={W}/>
    <rect x="42" y="8" width="36" height="8" rx="4" fill={Y} stroke={N} strokeWidth="3"/>
  </>,

  SST: <>
    <circle cx="60" cy="58" r="42" fill={S} stroke={N} strokeWidth="4"/>
    <path d="M31 52c10-8 19-9 27-3 6 5 7 11 1 17-7 7-19 8-26 2-5-4-6-10-2-16Z" fill={G}/>
    <path d="M70 68c8-7 19-4 21 4 2 8-5 15-13 16-8 1-13-6-12-12 0-3 1-6 4-8Z" fill={G}/>
    <path d="M29 61c10-4 20-4 31 1 10 5 20 5 31 0" fill="none" stroke={N} strokeWidth="3" strokeLinecap="round"/>
    <path d="M60 17c-5 13-6 26-5 41 1 15 1 29-4 40M60 17c5 13 6 26 5 41-1 15-1 29 4 40"
      fill="none" stroke={N} strokeWidth="2.5" strokeLinecap="round"/>
    <g transform="translate(47 43)">
      <rect x="0" y="0" width="26" height="21" rx="3" fill={W} stroke={N} strokeWidth="2.5"/>
      <path d="M4 6h18M4 11h14M4 16h10" stroke={P} strokeWidth="2" strokeLinecap="round"/>
      <path d="M5 0v-4h16v4" fill={Y} stroke={N} strokeWidth="2.5"/>
    </g>
    <path d="M43 104h34" stroke={N} strokeWidth="5" strokeLinecap="round"/>
  </>,

  English: <>
    <rect x="16" y="14" width="88" height="92" rx="14" fill={W} stroke={N} strokeWidth="4"/>
    <text x="60" y="83" textAnchor="middle" fontFamily="Lato, Arial, sans-serif" fontSize="62" fontWeight="700" fill={N}>A</text>
    <path d="M30 94h60" stroke={Y} strokeWidth="7" strokeLinecap="round"/>
  </>,

  Hindi: <>
    <rect x="16" y="14" width="88" height="92" rx="14" fill={Y} stroke={N} strokeWidth="4"/>
    <text x="60" y="80" textAnchor="middle" fontFamily="Noto Sans Devanagari, Nirmala UI, sans-serif" fontSize="55" fontWeight="700" fill={N}>अ</text>
    <path d="M30 96h60" stroke={P} strokeWidth="7" strokeLinecap="round"/>
  </>,

  Urdu: <>
    <rect x="16" y="14" width="88" height="92" rx="14" fill={P} stroke={N} strokeWidth="4"/>
    <text x="60" y="80" textAnchor="middle" direction="rtl" fontFamily="Noto Naskh Arabic, Noto Sans Arabic, Nirmala UI, sans-serif" fontSize="48" fontWeight="700" fill={N}>ا</text>
    <path d="M30 96h60" stroke={W} strokeWidth="7" strokeLinecap="round"/>
  </>,

  Biology: <>
    <path d="M35 16C84 28 84 92 35 104M85 16C36 28 36 92 85 104"
      fill="none" stroke={N} strokeWidth="5" strokeLinecap="round"/>
    <path d="M43 24h34M37 38h46M36 52h48M37 67h46M40 82h40M47 96h26"
      stroke={G} strokeWidth="5" strokeLinecap="round"/>
    <circle cx="35" cy="16" r="6" fill={S} stroke={N} strokeWidth="3"/>
    <circle cx="85" cy="16" r="6" fill={K} stroke={N} strokeWidth="3"/>
    <circle cx="35" cy="104" r="6" fill={K} stroke={N} strokeWidth="3"/>
    <circle cx="85" cy="104" r="6" fill={S} stroke={N} strokeWidth="3"/>
  </>,

  Physics: <>
    <ellipse cx="60" cy="60" rx="49" ry="19" fill="none" stroke={N} strokeWidth="4"/>
    <ellipse cx="60" cy="60" rx="49" ry="19" transform="rotate(60 60 60)" fill="none" stroke={N} strokeWidth="4"/>
    <ellipse cx="60" cy="60" rx="49" ry="19" transform="rotate(120 60 60)" fill="none" stroke={N} strokeWidth="4"/>
    <circle cx="60" cy="60" r="12" fill={Y} stroke={N} strokeWidth="4"/>
    <circle cx="104" cy="50" r="6" fill={K} stroke={N} strokeWidth="3"/>
    <circle cx="30" cy="36" r="6" fill={S} stroke={N} strokeWidth="3"/>
  </>,

  Chemistry: <>
    <path d="M45 12h30v25l13 48c3 10-4 19-14 19H46c-10 0-17-9-14-19l13-48Z"
      fill={W} stroke={N} strokeWidth="4" strokeLinejoin="round"/>
    <path d="M37 68h46l4 17c2 7-3 14-10 14H43c-7 0-12-7-10-14Z"
      fill={P} stroke={N} strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M39 69h42" fill="none" stroke={S} strokeWidth="3" strokeLinecap="round"/>
    <rect x="41" y="8" width="38" height="8" rx="4" fill={Y} stroke={N} strokeWidth="3"/>
    <circle cx="94" cy="34" r="7" fill={K} stroke={N} strokeWidth="3"/>
    <circle cx="102" cy="51" r="4" fill={Y} stroke={N} strokeWidth="2.5"/>
  </>,

  notes: <>
    <rect x="22" y="12" width="70" height="96" rx="8" fill={W} stroke={N} strokeWidth="4"/>
    <path d="M22 30h70" stroke={N} strokeWidth="4"/>
    <circle cx="38" cy="21" r="3" fill={N}/><circle cx="57" cy="21" r="3" fill={N}/><circle cx="76" cy="21" r="3" fill={N}/>
    <path d="M36 50h42M36 64h42M36 78h26" stroke={P} strokeWidth="5" strokeLinecap="round"/>
    <path d="M92 74l12-40 10 4-12 40-12 8Z" fill={K} stroke={N} strokeWidth="3.5" strokeLinejoin="round"/>
  </>,

  papers: <>
    <rect x="34" y="8" width="66" height="88" rx="8" fill={Y} stroke={N} strokeWidth="4" transform="rotate(8 67 52)"/>
    <rect x="16" y="18" width="66" height="88" rx="8" fill={W} stroke={N} strokeWidth="4"/>
    <path d="M30 42h38M30 56h38M30 70h24" stroke={N} strokeWidth="4" strokeLinecap="round"/>
    <circle cx="66" cy="88" r="12" fill={G} stroke={N} strokeWidth="3.5"/>
    <path d="M60 88l4 4 8-8" stroke={W} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
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

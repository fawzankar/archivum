import React from 'react';

/* Flat academic illustrations. Kept intentionally simple and consistent across cards. */
const N = '#1b2166', W = '#ffffff', Y = '#ffc75f', P = '#8d9bff', K = '#ffbdde', G = '#2fb36d', S = '#5ec4f5';

const art: Record<string, React.ReactNode> = {
  Maths: <>
    <path d="M25 90h70" stroke={N} strokeWidth="4" strokeLinecap="round"/>
    <path d="M31 90 49 28h24l16 62" fill={W} stroke={N} strokeWidth="4" strokeLinejoin="round"/>
    <path d="M48 28h26" stroke={Y} strokeWidth="8" strokeLinecap="round"/>
    <path d="M40 63h42M37 74h48" stroke={S} strokeWidth="4" strokeLinecap="round"/>
    <path d="M49 28 42 90M73 28l7 62" stroke={N} strokeWidth="3"/>
    <circle cx="60" cy="48" r="5" fill={G} stroke={N} strokeWidth="3"/>
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
    <path d="M24 88h72" stroke={N} strokeWidth="4" strokeLinecap="round"/>
    <path d="M29 80c9-20 16-37 31-49 7-6 16-9 28-8-3 10-8 18-16 24-11 8-20 18-27 33Z"
      fill={S} stroke={N} strokeWidth="4" strokeLinejoin="round"/>
    <path d="M74 55c11-1 20 2 25 9-6 8-14 12-25 10-6-2-9-7-8-12 1-4 4-6 8-7Z"
      fill={G} stroke={N} strokeWidth="3.5"/>
    <path d="M43 42c9 5 15 11 18 18M37 57c8 3 14 7 19 12" fill="none" stroke={Y} strokeWidth="4" strokeLinecap="round"/>
    <circle cx="82" cy="28" r="7" fill={K} stroke={N} strokeWidth="3"/>
  </>,

  English: <>
    <rect x="16" y="14" width="88" height="92" rx="14" fill={W} stroke={N} strokeWidth="4"/>
    <text x="60" y="83" textAnchor="middle" fontFamily="Lato, Arial, sans-serif" fontSize="62" fontWeight="700" fill={N}>A</text>
    <path d="M30 94h60" stroke={Y} strokeWidth="7" strokeLinecap="round"/>
  </>,

  Hindi: <>
    <rect x="8" y="9" width="104" height="102" rx="18" fill={Y} stroke={N} strokeWidth="4.5"/>
    <text x="60" y="61" textAnchor="middle" dominantBaseline="central"
      fontFamily="Noto Sans Devanagari, Nirmala UI, Mangal, sans-serif"
      fontSize="52" fontWeight="700" fill={N}>ह</text>
    <path d="M24 98h72" stroke={P} strokeWidth="7" strokeLinecap="round"/>
  </>,

  Urdu: <>
    <rect x="8" y="9" width="104" height="102" rx="18" fill={P} stroke={N} strokeWidth="4.5"/>
    <text x="60" y="59" textAnchor="middle" dominantBaseline="central" direction="rtl"
      fontFamily="Noto Naskh Arabic, Noto Sans Arabic, sans-serif"
      fontSize="58" fontWeight="700" fill={N}>ا</text>
    <path d="M24 98h72" stroke={W} strokeWidth="7" strokeLinecap="round"/>
  </>,

  Biology: <>
    <path d="M25 18c10 2 17 9 22 19 6 12 8 24 20 31 11 7 19 17 24 34"
      fill="none" stroke={Y} strokeWidth="8" strokeLinecap="round"/>
    <path d="M95 18c-10 2-17 9-22 19-6 12-8 24-20 31-11 7-19 17-24 34"
      fill="none" stroke={K} strokeWidth="8" strokeLinecap="round"/>
    <path d="M33 28h54M27 44h66M29 60h62M29 76h62M36 92h48"
      stroke={N} strokeWidth="4" strokeLinecap="round"/>
    <path d="M78 18h15l-7 15h-8Z" fill={S} stroke={N} strokeWidth="3"/>
    <path d="M72 32c-7 4-11 10-12 17M58 49c-7 4-10 9-10 15" fill="none" stroke={G} strokeWidth="5" strokeLinecap="round"/>
    <circle cx="43" cy="103" r="7" fill={S} stroke={N} strokeWidth="3"/>
    <path d="M50 103h45" stroke={N} strokeWidth="5" strokeLinecap="round"/>
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
    <path d="M47 10h26v30l10 50c2 10-5 18-15 18H52c-10 0-17-8-15-18l10-50Z"
      fill={W} stroke={N} strokeWidth="4" strokeLinejoin="round"/>
    <rect x="43" y="7" width="34" height="9" rx="4.5" fill={Y} stroke={N} strokeWidth="3"/>
    <path d="M43 67h34l4 23c1 8-4 13-12 13H51c-8 0-13-5-12-13Z" fill={S} stroke={N} strokeWidth="3"/>
    <path d="M44 67h32" stroke={W} strokeWidth="3.5" strokeLinecap="round"/>
    <circle cx="54" cy="83" r="4" fill={W}/>
    <circle cx="68" cy="90" r="3" fill={W}/>
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

/* [centreX, centreY, scale] of each artwork's real painted bounds, so all icons sit dead-centre
   and share a consistent visual size (max 100 units). */
const FIT: Record<string, [number, number, number]> = {
  Maths: [60, 60, 1], Science: [60, 56.3, 1], SST: [60, 60, 1], English: [60, 60, 1],
  Hindi: [60, 60, 0.92], Urdu: [60, 60, 0.92], Biology: [60, 60, 0.9], Physics: [60.3, 60, 0.98],
  Chemistry: [60, 60, 0.96], notes: [67.9, 60, 1], papers: [60.4, 55.4, 0.95], default: [60, 58, 1],
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
  const k = art[key] ? key : 'default';
  const [cx, cy, sc] = FIT[k] || [60, 60, 1];
  // Re-centre every illustration on the 120x120 canvas (measured from the rendered artwork).
  return <svg className={`art ${className}`} viewBox="0 0 120 120" role="img" aria-hidden="true" focusable="false"><g transform={`translate(60 60) scale(${sc}) translate(${-cx} ${-cy})`}>{art[k]}</g></svg>;
}

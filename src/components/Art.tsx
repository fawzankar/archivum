import React from 'react';

/* Flat academic illustrations. Kept intentionally simple and consistent across cards. */
const N = '#1b2166', W = '#ffffff', Y = '#ffc75f', P = '#8d9bff', K = '#ffbdde', G = '#2fb36d', S = '#5ec4f5';

const art: Record<string, React.ReactNode> = {
  Maths: <>
    <circle cx="60" cy="60" r="43" fill={W} stroke={N} strokeWidth="4"/>
    <g transform="translate(60 60)">
      <text x="0" y="1" textAnchor="middle" dominantBaseline="central"
        fontFamily="STIX Two Math, Cambria Math, DejaVu Serif, serif"
        fontSize="60" fontWeight="700" fontStyle="italic" fill={N}>π</text>
    </g>
    <path d="M31 98h58" stroke={S} strokeWidth="7" strokeLinecap="round"/>
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
    <circle cx="60" cy="60" r="44" fill={S} stroke={N} strokeWidth="4"/>
    <ellipse cx="60" cy="60" rx="18" ry="43" fill="none" stroke={N} strokeWidth="2.5"/>
    <path d="M16 60h88M21 42h78M21 78h78" fill="none" stroke={N} strokeWidth="2.5" strokeLinecap="round" opacity=".72"/>
    <path d="M42 30c6-6 12-5 16 1 3 4 0 8-5 10-5 2-8 7-11 10-4 4-10 3-13-2 3-8 7-14 13-19ZM76 67c7-4 13-1 15 5 2 7-3 12-10 14-6 1-10-3-11-8-1-4 2-8 6-11Z"
      fill={G} stroke={N} strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M60 16v88" stroke={N} strokeWidth="2" strokeDasharray="3 5" opacity=".6"/>
    <path d="M43 106h34" stroke={N} strokeWidth="5" strokeLinecap="round"/>
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
    <circle cx="60" cy="60" r="45" fill={W} stroke={N} strokeWidth="4"/>
    <path d="M38 16c38 17 38 34 0 51-18 8-18 23 0 37"
      fill="none" stroke={S} strokeWidth="8" strokeLinecap="round"/>
    <path d="M82 16c-38 17-38 34 0 51 18 8 18 23 0 37"
      fill="none" stroke={K} strokeWidth="8" strokeLinecap="round"/>
    <path d="M42 27h36M34 44h52M34 60h52M34 76h52M42 93h36"
      stroke={G} strokeWidth="4.5" strokeLinecap="round"/>
    <circle cx="38" cy="16" r="5" fill={S} stroke={N} strokeWidth="2.5"/>
    <circle cx="82" cy="16" r="5" fill={K} stroke={N} strokeWidth="2.5"/>
    <circle cx="38" cy="104" r="5" fill={K} stroke={N} strokeWidth="2.5"/>
    <circle cx="82" cy="104" r="5" fill={S} stroke={N} strokeWidth="2.5"/>
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
    <path d="M47 40h26" stroke={N} strokeWidth="4" strokeLinecap="round"/>
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
  Maths: [60, 58, 1], Science: [60, 56.3, 1], SST: [60, 60.3, 1], English: [60, 60, 1],
  Hindi: [60, 60, 0.92], Urdu: [60, 60, 0.92], Biology: [60, 60, 0.87], Physics: [60.3, 60, 0.98],
  Chemistry: [60, 57.8, 0.96], notes: [67.9, 60, 1], papers: [60.4, 55.4, 0.95], default: [60, 58, 1],
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

import React, { useId } from 'react';

/* Flat academic illustrations - every one of them is gently animated (see the "Animated subject icons"
   block at the end of globals.css). Animated parts carry an `ai-*` class; SMIL is used only where an
   element has to travel along a path (atom electrons). */
const N = '#1b2166', W = '#ffffff', Y = '#ffc75f', P = '#8d9bff', K = '#ffbdde', G = '#2fb36d', S = '#5ec4f5';
const G2 = '#7bdca0', SOIL = '#c98a52', PIN = '#ff6b8b';

/* Custom CSS properties (animation delay / distance) on SVG elements. */
const v = (o: Record<string, string>) => o as React.CSSProperties;

/* Outline glyphs converted to vector paths, so they render identically on every device and are
   mathematically centred on their canvas (no font loading, no baseline guesswork).
   - π: STIX Two Text Bold Italic, bounding box centred on (60,58)
   - अ: Yatra One (new Hindi typeface), bounding box centred on (60,56) */
const PI_PATH = 'M35.2 51.6 32.5 50.1Q35.7 43.8 41.6 40Q47.5 36.2 54.6 36.2Q59 36.3 63.2 36.4Q67.4 36.5 71.6 36.5Q75.2 36.5 78.9 36.5Q82.6 36.4 86.5 36L87.8 37Q87.5 38.5 86.5 40.9Q85.6 43.3 83.7 45.2Q81.9 47.1 78.7 47.1Q76.6 47.1 74.7 47Q72.8 46.9 71.2 46.7Q69.6 46.6 68.3 46.6Q66.1 46.6 62.9 46.5Q59.7 46.5 57.1 46.5Q54.5 46.4 53.8 46.4Q49.1 46.4 46.2 46.5Q43.2 46.7 41.3 47.2Q39.5 47.8 38 48.8Q36.6 49.8 35.2 51.6ZM43.6 79.2H32.2L32.3 76.7Q36 72.1 39.8 67Q43.7 61.9 47 56.5Q50.3 51.1 52.2 45.5L56.3 45.7Q55.6 48.5 54.5 52.1Q53.3 55.7 52 59.6Q50.6 63.6 49.1 67.3Q47.7 71.1 46.3 74.2Q44.8 77.3 43.6 79.2ZM64.8 80Q61.6 80 59.8 78.1Q58.1 76.3 58.1 72.5Q58.1 68.9 59.4 64.9Q60.6 60.9 62.8 56Q65 51.2 67.7 45L72.2 46Q71.5 47.8 70.5 50.6Q69.6 53.3 68.6 56.4Q67.7 59.4 67.1 62Q66.5 64.7 66.5 66.2Q66.5 68.1 67.3 69.4Q68 70.6 70.1 70.6Q73.1 70.6 74.6 69.5Q76.1 68.4 77.5 67.1L79.6 68.9Q78.2 71.5 75.9 74.1Q73.7 76.6 70.9 78.3Q68.1 80 64.8 80Z';
const HINDI_PATH = 'M68.7 37.2 65.7 29.5H91.1V37.2H85.9V83L76.1 78.6V57.4Q75.1 57.7 74.2 57.9Q73.2 58.1 72.2 58.1Q71.2 58 70.5 58Q69.8 57.9 68.7 57.6Q67.7 57.3 67.1 57.1Q66.6 57 65.5 56.5Q64.4 56 64 55.8Q63.7 55.6 62.5 55Q61.3 54.4 61.1 54.3L60.8 54.6Q62.7 55.9 63.1 56.2Q63.6 56.5 65.3 57.8Q67 59.1 67.8 60Q68.5 61 69.6 62.5Q70.6 64 71.1 65.7Q72.2 68.6 70 71.9Q67.8 75.1 64 77.2Q60.3 79.3 56 80.1Q51.8 80.9 48.7 79Q41.8 74.8 28.9 55.8L30.9 54.4Q31 54.5 32.4 56.4Q33.8 58.3 34.4 59Q35 59.8 36.6 61.7Q38.2 63.6 39.2 64.6Q40.2 65.5 42 67.1Q43.7 68.6 45.1 69.4Q46.4 70.1 48.2 70.9Q50 71.7 51.6 71.9Q53.2 72 55.1 71.7Q57 71.3 58.8 70.4Q63.1 67.9 62.7 64.1Q62.3 60.3 57.8 56.4Q53.6 58.3 48.9 58.5L44.6 51.1Q52.7 50.2 57.1 47.4Q61.5 44.5 60.1 41Q58.9 38 56.2 37.1Q53.6 36.3 50.3 37.6Q47 38.8 45 39.9Q43 41 40.8 42.5L36 35.6L37.5 34.5Q39.1 33.4 40 32.9Q40.8 32.4 42.7 31.3Q44.5 30.3 45.8 29.9Q47.1 29.5 48.8 29.1Q50.4 28.8 51.9 29.2Q53.3 29.5 54.5 30.5Q61.5 36.4 65.1 40Q67.7 42.9 66.9 46.6Q66 50.3 62.3 53.4Q70.2 54.7 76.1 48.8V37.2Z';

const SPARK = 'M0-6 1.6-1.6 6 0 1.6 1.6 0 6-1.6 1.6-6 0-1.6-1.6Z';
const ORBIT = 'M11 60a49 19 0 1 0 98 0a49 19 0 1 0-98 0Z';

/* World globe: continents scroll sideways behind a circular clip (the land tile repeats every 84 units, so
   the loop is seamless). Latitude lines stay still, exactly like a real globe turning on its axis.
   Needs its own clip id, so it is a component rather than a static fragment. */
const LAND = 'M26 40c6-8 16-10 24-5 5 3 4 9-1 12-4 3-3 8-8 10-6 3-14-1-16-8-1-3-1-6 1-9ZM60 62c8-4 18-2 22 5 3 6-2 12-6 16-5 4-12 2-15-3-3-5-4-14-1-18ZM74 36c8-6 18-6 24 0 3 3-1 8-6 9-6 1-10-1-14-3-3-2-4-4-4-6ZM40 76c3-2 7-1 8 2s-2 6-5 5-4-5-3-7Z';
function Globe() {
  const id = `globe${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return <>
    <defs><clipPath id={id}><circle cx="60" cy="56" r="42"/></clipPath></defs>
    <circle cx="60" cy="56" r="42" fill={S}/>
    <g clipPath={`url(#${id})`}>
      <g className="ai-globe">
        <path d={LAND} fill={G}/>
        <path d={LAND} fill={G} transform="translate(84 0)"/>
      </g>
      <path d="M14 38h92M14 56h92M14 74h92" stroke={W} strokeWidth="1.6" opacity=".5"/>
      <path d="M64 12a42 42 0 0 1 0 88 34 42 0 0 0 0-88Z" fill={N} opacity=".13"/>
    </g>
    <path d="M32 30a34 34 0 0 0-5 20" fill="none" stroke={W} strokeWidth="4" strokeLinecap="round" opacity=".75"/>
    <circle cx="60" cy="56" r="42" fill="none" stroke={N} strokeWidth="4"/>
    <path d="M42 106h36" stroke={N} strokeWidth="5" strokeLinecap="round"/>
  </>;
}

const art: Record<string, React.ReactNode> = {
  Maths: <>
    <circle cx="60" cy="58" r="43" fill={W} stroke={N} strokeWidth="4"/>
    {/* two dots circling the rim */}
    <g className="ai-orbit">
      <circle cx="60" cy="58" r="43" fill="none"/>
      <circle cx="60" cy="15" r="5.5" fill={Y} stroke={N} strokeWidth="3"/>
      <circle cx="60" cy="101" r="5.5" fill={K} stroke={N} strokeWidth="3"/>
    </g>
    <path className="ai-pop" d={PI_PATH} fill={N}/>
    <path className="ai-stretch" d="M31 96h58" stroke={S} strokeWidth="7" strokeLinecap="round"/>
  </>,

  Science: <>
    <g className="ai-float">
      <path d="M47 12h26v29l22 45c4 9-3 18-13 18H38c-10 0-17-9-13-18l22-45Z"
        fill={W} stroke={N} strokeWidth="4" strokeLinejoin="round"/>
      <g className="ai-slosh">
        <path d="M30 75h60l7 15c2 7-3 14-11 14H34c-8 0-13-7-11-14Z" fill={G} stroke={N} strokeWidth="2.5" strokeLinejoin="round"/>
        <path className="ai-wave" d="M31 76h58" fill="none" stroke={S} strokeWidth="3.5" strokeLinecap="round"/>
        <circle cx="50" cy="91" r="4" fill={W}/>
        <circle cx="72" cy="87" r="3.5" fill={W}/>
      </g>
      {/* bubbles rising through the neck */}
      <circle className="ai-bubble" style={v({ '--rise': '-52px' })} cx="58" cy="72" r="3" fill={W} stroke={N} strokeWidth="2"/>
      <circle className="ai-bubble" style={v({ '--rise': '-46px', animationDelay: '.9s' })} cx="64" cy="70" r="2.4" fill={W} stroke={N} strokeWidth="2"/>
      <circle className="ai-bubble" style={v({ '--rise': '-56px', animationDelay: '1.7s' })} cx="60" cy="72" r="2" fill={W} stroke={N} strokeWidth="2"/>
      <rect x="42" y="8" width="36" height="8" rx="4" fill={Y} stroke={N} strokeWidth="3"/>
    </g>
  </>,

  /* NEW - a spinning world globe */
  SST: <Globe />,

  English: <>
    <rect x="16" y="14" width="88" height="92" rx="14" fill={W} stroke={N} strokeWidth="4"/>
    <text className="ai-hop" x="60" y="83" textAnchor="middle" fontFamily="Lato, Arial, sans-serif" fontSize="62" fontWeight="700" fill={N}>A</text>
    <path className="ai-stretch" d="M30 94h60" stroke={Y} strokeWidth="7" strokeLinecap="round"/>
    <g transform="translate(88 30)"><path className="ai-twinkle" style={v({ animationDelay: '.3s' })} d={SPARK} fill={P}/></g>
  </>,

  Hindi: <>
    <rect x="8" y="9" width="104" height="102" rx="18" fill={Y} stroke={N} strokeWidth="4.5"/>
    <path className="ai-float" d={HINDI_PATH} fill={N}/>
    <path className="ai-stretch" d="M24 98h72" stroke={P} strokeWidth="7" strokeLinecap="round"/>
    <g transform="translate(24 26)"><path className="ai-twinkle" style={v({ animationDelay: '.6s' })} d={SPARK} fill={W}/></g>
  </>,

  Urdu: <>
    <rect x="8" y="9" width="104" height="102" rx="18" fill={P} stroke={N} strokeWidth="4.5"/>
    <text className="ai-sway-b" x="60" y="59" textAnchor="middle" dominantBaseline="central" direction="rtl"
      fontFamily="Noto Naskh Arabic, Noto Sans Arabic, sans-serif" fontSize="58" fontWeight="700" fill={N}>ا</text>
    <path className="ai-stretch" d="M24 98h72" stroke={W} strokeWidth="7" strokeLinecap="round"/>
    <g transform="translate(96 26)"><path className="ai-twinkle" style={v({ animationDelay: '.6s' })} d={SPARK} fill={Y}/></g>
  </>,

  /* NEW - a sprouting seedling: swaying leaves, growing stem, twinkling sparkles */
  Biology: <>
    <circle cx="60" cy="60" r="44" fill="#d9f7e5"/>
    <path d="M23.1 84Q60 72 96.9 84A44 44 0 0 1 23.1 84Z" fill={SOIL}/>
    <circle cx="44" cy="90" r="2.4" fill="#a9703f"/><circle cx="66" cy="94" r="2.4" fill="#a9703f"/><circle cx="78" cy="87" r="2" fill="#a9703f"/>
    <g className="ai-grow">
      <path d="M60 84C60 72 58 62 60 46" fill="none" stroke="#1f8f55" strokeWidth="5" strokeLinecap="round"/>
      <path className="ai-sway-l" d="M60 66C44 68 33 60 31 47C47 45 60 52 60 66Z" fill={G} stroke={N} strokeWidth="3" strokeLinejoin="round"/>
      <path className="ai-sway-r" d="M60 54C74 54 86 44 88 30C72 30 60 38 60 54Z" fill={G2} stroke={N} strokeWidth="3" strokeLinejoin="round"/>
    </g>
    <circle cx="60" cy="60" r="44" fill="none" stroke={N} strokeWidth="4"/>
    <g transform="translate(35 34)"><path className="ai-twinkle" d={SPARK} fill={Y}/></g>
    <g transform="translate(88 66)"><path className="ai-twinkle" style={v({ animationDelay: '1s' })} d={SPARK} fill={Y}/></g>
  </>,

  Physics: <>
    {[0, 60, 120].map(a => (
      <ellipse key={a} cx="60" cy="60" rx="49" ry="19" transform={`rotate(${a} 60 60)`} fill="none" stroke={N} strokeWidth="4"/>
    ))}
    {[[0, K, '3.2s', '0s'], [60, S, '4.2s', '-1.2s'], [120, G, '5.2s', '-2.6s']].map(([a, c, dur, begin]) => (
      <g key={a as number} transform={`rotate(${a} 60 60)`}>
        <circle cx="0" cy="0" r="6" fill={c as string} stroke={N} strokeWidth="3">
          <animateMotion dur={dur as string} begin={begin as string} repeatCount="indefinite" path={ORBIT}/>
        </circle>
      </g>
    ))}
    <circle className="ai-pop" cx="60" cy="60" r="12" fill={Y} stroke={N} strokeWidth="4"/>
  </>,

  Chemistry: <>
    <g className="ai-float">
      <g className="ai-slosh">
        <path d="M42.6 62Q51 56 60 62T77.4 62L83 90c2 10-5 18-15 18H52c-10 0-17-8-15-18Z" fill={K}/>
        <path className="ai-wave" d="M44 62Q52 57 60 62T76 62" fill="none" stroke={W} strokeWidth="3" strokeLinecap="round"/>
      </g>
      <circle className="ai-bubble" style={v({ '--rise': '-44px' })} cx="54" cy="94" r="3.6" fill={W} stroke={N} strokeWidth="2"/>
      <circle className="ai-bubble" style={v({ '--rise': '-58px', animationDelay: '.8s' })} cx="66" cy="90" r="3" fill={W} stroke={N} strokeWidth="2"/>
      <circle className="ai-bubble" style={v({ '--rise': '-64px', animationDelay: '1.6s' })} cx="60" cy="92" r="2.2" fill={W} stroke={N} strokeWidth="2"/>
      <path d="M47 10h26v30l10 50c2 10-5 18-15 18H52c-10 0-17-8-15-18l10-50Z" fill="none" stroke={N} strokeWidth="4" strokeLinejoin="round"/>
      <rect x="43" y="7" width="34" height="9" rx="4.5" fill={Y} stroke={N} strokeWidth="3"/>
      <path d="M47 40h26" stroke={N} strokeWidth="4" strokeLinecap="round"/>
    </g>
  </>,

  notes: <>
    <rect x="22" y="12" width="70" height="96" rx="8" fill={W} stroke={N} strokeWidth="4"/>
    <path d="M22 30h70" stroke={N} strokeWidth="4"/>
    <circle cx="38" cy="21" r="3" fill={N}/><circle cx="57" cy="21" r="3" fill={N}/><circle cx="76" cy="21" r="3" fill={N}/>
    <path className="ai-line" style={v({ animationDelay: '0s' })} d="M36 50h42" stroke={P} strokeWidth="5" strokeLinecap="round"/>
    <path className="ai-line" style={v({ animationDelay: '.35s' })} d="M36 64h42" stroke={P} strokeWidth="5" strokeLinecap="round"/>
    <path className="ai-line" style={v({ animationDelay: '.7s' })} d="M36 78h26" stroke={P} strokeWidth="5" strokeLinecap="round"/>
    <path className="ai-write" d="M92 74l12-40 10 4-12 40-12 8Z" fill={K} stroke={N} strokeWidth="3.5" strokeLinejoin="round"/>
  </>,

  papers: <>
    <g transform="rotate(8 67 52)"><rect className="ai-sheet" x="34" y="8" width="66" height="88" rx="8" fill={Y} stroke={N} strokeWidth="4"/></g>
    <rect x="16" y="18" width="66" height="88" rx="8" fill={W} stroke={N} strokeWidth="4"/>
    <path d="M30 42h38M30 56h38M30 70h24" stroke={N} strokeWidth="4" strokeLinecap="round"/>
    <g className="ai-pop">
      <circle cx="66" cy="88" r="12" fill={G} stroke={N} strokeWidth="3.5"/>
      <path d="M60 88l4 4 8-8" stroke={W} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
  </>,

  default: <>
    <rect className="ai-stack" style={v({ animationDelay: '.3s' })} x="14" y="70" width="92" height="20" rx="4" fill={P} stroke={N} strokeWidth="4"/>
    <rect className="ai-stack" style={v({ animationDelay: '.15s' })} x="22" y="48" width="80" height="22" rx="4" fill={Y} stroke={N} strokeWidth="4"/>
    <rect className="ai-stack" x="18" y="26" width="84" height="22" rx="4" fill={K} stroke={N} strokeWidth="4"/>
  </>,

  /* ---- Page illustrations: one per page/section so no two headers share the same picture ---- */
  about: <>
    <path d="M60 10 14 40h92Z" fill={Y} stroke={N} strokeWidth="4" strokeLinejoin="round"/>
    <circle className="ai-twinkle" cx="60" cy="29" r="5" fill={W} stroke={N} strokeWidth="3"/>
    {[22, 42, 62, 82].map((x, i) => <rect key={x} className="ai-grow" style={v({ animationDelay: `${i * 0.25}s` })} x={x} y="47" width="14" height="44" rx="2" fill={W} stroke={N} strokeWidth="3.5"/>)}
    <rect x="12" y="92" width="96" height="14" rx="4" fill={P} stroke={N} strokeWidth="4"/>
  </>,

  contact: <>
    <rect x="14" y="40" width="72" height="52" rx="8" fill={W} stroke={N} strokeWidth="4"/>
    <path d="M17 46 50 70 83 46" fill="none" stroke={N} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <g className="ai-float">
      <path d="M62 14h38a10 10 0 0 1 10 10v22a10 10 0 0 1-10 10H88L78 68V56H62a10 10 0 0 1-10-10V24a10 10 0 0 1 10-10Z" fill={K} stroke={N} strokeWidth="4" strokeLinejoin="round"/>
      {[67, 81, 95].map((x, i) => <circle key={x} className="ai-pop" style={v({ animationDelay: `${i * 0.25}s` })} cx={x} cy="35" r="3.4" fill={N}/>)}
    </g>
  </>,

  people: <>
    <g className="ai-hop" style={v({ animationDelay: '.3s' })}><circle cx="34" cy="46" r="11" fill={P} stroke={N} strokeWidth="4"/><path d="M14 94c0-16 9-26 20-26s20 10 20 26Z" fill={P} stroke={N} strokeWidth="4" strokeLinejoin="round"/></g>
    <g className="ai-hop" style={v({ animationDelay: '.15s' })}><circle cx="86" cy="46" r="11" fill={K} stroke={N} strokeWidth="4"/><path d="M66 94c0-16 9-26 20-26s20 10 20 26Z" fill={K} stroke={N} strokeWidth="4" strokeLinejoin="round"/></g>
    <g className="ai-hop"><circle cx="60" cy="36" r="14" fill={Y} stroke={N} strokeWidth="4"/><path d="M34 102c0-20 11-32 26-32s26 12 26 32Z" fill={Y} stroke={N} strokeWidth="4" strokeLinejoin="round"/></g>
  </>,

  saved: <>
    <rect x="24" y="14" width="72" height="92" rx="8" fill={W} stroke={N} strokeWidth="4"/>
    <path d="M38 40h20M38 54h20M38 80h44M38 92h28" stroke={P} strokeWidth="4.5" strokeLinecap="round"/>
    <path className="ai-hop" d="M66 14h22v46l-11-9-11 9Z" fill={K} stroke={N} strokeWidth="3.5" strokeLinejoin="round"/>
  </>,

  search: <>
    <g className="ai-float">
      <circle cx="52" cy="52" r="30" fill={S} stroke={N} strokeWidth="5"/>
      <path className="ai-twinkle" d="M36 46a17 17 0 0 1 12-12" fill="none" stroke={W} strokeWidth="5" strokeLinecap="round"/>
      <path d="M75 75 101 101" stroke={N} strokeWidth="11" strokeLinecap="round"/>
      <path d="M75 75 101 101" stroke={Y} strokeWidth="4" strokeLinecap="round"/>
    </g>
  </>,

  tips: <>
    <g className="ai-twinkle"><path d="M18 22 10 16M102 22l8-6M16 46H6M104 46h10" stroke={N} strokeWidth="4" strokeLinecap="round"/></g>
    <g className="ai-float">
      <path d="M60 12c-19 0-32 14-32 31 0 11 6 18 12 24 4 4 5 8 5 13h30c0-5 1-9 5-13 6-6 12-13 12-24 0-17-13-31-32-31Z" fill={Y} stroke={N} strokeWidth="4" strokeLinejoin="round"/>
      <path d="M51 48l9 14 9-14" fill="none" stroke={N} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="44" y="84" width="32" height="9" rx="4" fill={W} stroke={N} strokeWidth="3.5"/>
      <rect x="48" y="95" width="24" height="8" rx="4" fill={P} stroke={N} strokeWidth="3.5"/>
    </g>
  </>,

  subjects: <>
    <g className="ai-pop"><rect x="14" y="14" width="44" height="44" rx="10" fill={P} stroke={N} strokeWidth="4"/><path d="M36 26v20M26 36h20" stroke={W} strokeWidth="4.5" strokeLinecap="round"/></g>
    <g className="ai-pop" style={v({ animationDelay: '.3s' })}><rect x="62" y="14" width="44" height="44" rx="10" fill={Y} stroke={N} strokeWidth="4"/><path d="M73 48l7-20 7 20M75 42h10" fill="none" stroke={N} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/></g>
    <g className="ai-pop" style={v({ animationDelay: '.6s' })}><rect x="14" y="62" width="44" height="44" rx="10" fill={K} stroke={N} strokeWidth="4"/><path d="M26 94c0-12 8-18 22-18 0 12-8 20-22 18Z" fill={W} stroke={N} strokeWidth="3" strokeLinejoin="round"/></g>
    <g className="ai-pop" style={v({ animationDelay: '.9s' })}><rect x="62" y="62" width="44" height="44" rx="10" fill={G2} stroke={N} strokeWidth="4"/><circle cx="84" cy="84" r="11" fill={W} stroke={N} strokeWidth="3"/><path d="M73 84h22" stroke={N} strokeWidth="3"/></g>
  </>,

  quest: <>
    <circle cx="60" cy="60" r="44" fill={W} stroke={N} strokeWidth="5"/>
    <circle cx="60" cy="60" r="34" fill="none" stroke={P} strokeWidth="3"/>
    <path d="M60 20v8M60 92v8M20 60h8M92 60h8" stroke={N} strokeWidth="4" strokeLinecap="round"/>
    <g className="ai-needle">
      <path d="M60 30l9 30H51Z" fill={K} stroke={N} strokeWidth="3" strokeLinejoin="round"/>
      <path d="M60 90l-9-30h18Z" fill={P} stroke={N} strokeWidth="3" strokeLinejoin="round"/>
    </g>
    <circle cx="60" cy="60" r="4" fill={N}/>
  </>,

  school: <>
    <path d="M60 18V4" stroke={N} strokeWidth="3" strokeLinecap="round"/>
    <path className="ai-flag" d="M60 4h19l-5 5.5L79 15H60Z" fill={K} stroke={N} strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M12 52 60 18l48 34Z" fill={Y} stroke={N} strokeWidth="4" strokeLinejoin="round"/>
    <rect x="20" y="52" width="80" height="50" rx="4" fill={W} stroke={N} strokeWidth="4"/>
    <circle cx="60" cy="40" r="7" fill={W} stroke={N} strokeWidth="3"/>
    <path d="M60 36v4h3.5" fill="none" stroke={N} strokeWidth="2.5" strokeLinecap="round"/>
    <rect x="28" y="62" width="16" height="14" rx="2" fill={S} stroke={N} strokeWidth="3"/>
    <rect x="76" y="62" width="16" height="14" rx="2" fill={S} stroke={N} strokeWidth="3"/>
    <rect x="50" y="72" width="20" height="30" rx="4" fill={P} stroke={N} strokeWidth="3.5"/>
  </>,
};

/* [centreX, centreY, scale] of each artwork's real painted bounds, so all icons sit dead-centre
   and share a consistent visual size (max 100 units). */
const FIT: Record<string, [number, number, number]> = {
  Maths: [60, 58, 0.97], Science: [60, 56.3, 1], SST: [60, 60.2, 1], English: [60, 60, 1],
  Hindi: [60, 60, 0.92], Urdu: [60, 60, 0.92], Biology: [60, 60, 0.97], Physics: [60.3, 60, 0.98],
  Chemistry: [60, 57.8, 0.96], notes: [67.9, 60, 1], papers: [60.4, 55.4, 0.95], default: [60, 58, 1],
  about: [60, 58, 1], contact: [62, 53, 1], people: [60, 61, 1], saved: [60, 60, 1], search: [64, 64, 0.95],
  tips: [59, 58, 0.92], subjects: [60, 60, 1], quest: [60, 60, 1.1], school: [60, 53, 1],
};

export default function Art({ name, className = '' }: { name: string; className?: string }) {
  const raw = (name || '').trim();
  const aliases: Record<string,string> = {
    maths:'Maths', mathematics:'Maths', math:'Maths',
    science:'Science', sst:'SST', socialscience:'SST', 'social science':'SST', 'social studies':'SST',
    english:'English', hindi:'Hindi', urdu:'Urdu', biology:'Biology', physics:'Physics', chemistry:'Chemistry',
    notes:'notes', paper:'papers', papers:'papers', 'previous year paper':'papers', 'previous papers':'papers'
  };
  const key = aliases[raw.toLowerCase()] || raw;
  const k = art[key] ? key : 'default';
  const [cx, cy, sc] = FIT[k] || [60, 60, 1];
  // Re-centre every illustration on the 120x120 canvas (measured from the rendered artwork).
  return <svg className={`art ${className}`} viewBox="0 0 120 120" role="img" aria-hidden="true" focusable="false"><g transform={`translate(60 60) scale(${sc}) translate(${-cx} ${-cy})`}>{art[k]}</g></svg>;
}

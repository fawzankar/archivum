// Everything the very first paint needs lives here: the splash styles, the logo and a tiny boot script.
// It is inlined into <head> by layout.tsx so the splash never depends on the CSS bundle, fonts or hydration.

// Cropped, alpha-only copy of archivum-mark-transparent.png, used as a CSS mask so the logo takes the theme colour.
const MARK = 'data:image/png;base64,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';

// [accent id, glow A, glow B, gradient start, middle, end, ink, solid page colour]
const THEMES: [string, string, string, string, string, string, string, string][] = [
  ['indigo', 'rgba(141,155,255,.62)', 'rgba(255,199,95,.24)', '#eef2ff', '#dce4ff', '#f8f9ff', '#1b2166', '#e4ecff'],
  ['forest', 'rgba(127,209,160,.52)', 'rgba(245,215,110,.22)', '#edf8f0', '#dcefe1', '#fbfdfb', '#123f2a', '#e3f3e6'],
  ['smoky-olive', 'rgba(216,207,188,.72)', 'rgba(121,116,101,.18)', '#fbf8f0', '#e9e3d7', '#fffdf8', '#454238', '#fffbf4'],
  ['smoky-ink', 'rgba(124,132,144,.32)', 'rgba(52,58,66,.18)', '#f3f5f7', '#e3e6ea', '#fbfcfd', '#20252b', '#f1f3f5'],
  ['soft-pink', 'rgba(251,179,187,.54)', 'rgba(155,49,96,.16)', '#fff7f8', '#fce8ed', '#fffdfd', '#70273f', '#fff7f8'],
  ['crimson-veil', 'rgba(145,43,72,.30)', 'rgba(252,208,217,.64)', '#fff4f7', '#f7dce4', '#fffafb', '#610027', '#fff4f7'],
];

const vars = (t: (typeof THEMES)[number]) =>
  `--ax-glow-a:${t[1]};--ax-glow-b:${t[2]};--ax-c1:${t[3]};--ax-c2:${t[4]};--ax-c3:${t[5]};--ax-ink:${t[6]};--ax-solid:${t[7]}`;

export const ACCENT_IDS = THEMES.map(t => t[0]);

export const BOOT_CSS = [
  `:root{--ax-mark:url("${MARK}");${vars(THEMES[0])}}`,
  ...THEMES.slice(1).map(t => `html[data-accent="${t[0]}"]{${vars(t)}}`),
  'html.dark{--ax-glow-a:rgba(120,135,255,.20);--ax-glow-b:rgba(255,199,95,.08);--ax-c1:#0f1419;--ax-c2:#131a21;--ax-c3:#0c1116;--ax-ink:#eef2f6;--ax-solid:#0f1419}',
  // While booting, nothing but the splash is visible, so the home page can never flash before it.
  'html.ax-booting{background:var(--ax-solid)!important;overflow:hidden!important}',
  'html.ax-booting body{overflow:hidden!important}',
  'html.ax-booting body>*:not(.ax-splash),html.ax-booting body>*:not(.ax-splash) *{visibility:hidden!important}',
  '.ax-splash{display:none}',
  'html.ax-booting .ax-splash,html.ax-leaving .ax-splash{display:grid;visibility:visible!important}',
  '.ax-splash{position:fixed;inset:0;z-index:2147483647;place-items:center;overflow:hidden;color:var(--ax-ink);' +
    'background:radial-gradient(circle at 24% 24%,var(--ax-glow-a) 0,transparent 34%),radial-gradient(circle at 78% 72%,var(--ax-glow-b) 0,transparent 30%),linear-gradient(140deg,var(--ax-c1) 0%,var(--ax-c2) 48%,var(--ax-c3) 100%);' +
    'transition:opacity .45s ease,transform .45s ease}',
  '.ax-splash.is-leaving{opacity:0;transform:scale(1.015);pointer-events:none}',
  '.ax-splash__body{display:flex;flex-direction:column;align-items:center;text-align:center;padding:24px;width:min(92vw,560px)}',
  '.ax-splash__mark{width:clamp(84px,22vw,116px);aspect-ratio:1.05;background:var(--ax-ink);-webkit-mask:var(--ax-mark) center/contain no-repeat;mask:var(--ax-mark) center/contain no-repeat;animation:axPop .6s cubic-bezier(.2,.8,.2,1) both}',
  '.ax-splash__word{margin-top:22px;font-family:"Lato",system-ui,Arial,sans-serif;font-size:clamp(28px,8vw,52px);font-weight:900;letter-spacing:.18em;line-height:1;text-indent:.18em;animation:axUp .6s ease .12s both}',
  '.ax-splash__kicker{margin:16px 0 0;font-family:"Lato",system-ui,Arial,sans-serif;font-size:clamp(9.5px,2.6vw,11px);font-weight:700;letter-spacing:.24em;opacity:.8;animation:axUp .6s ease .28s both}',
  '.ax-splash__quest{font-family:"Libre Baskerville",Georgia,"Times New Roman",serif;font-weight:700;letter-spacing:.2em}',
  '.ax-splash__bar{display:block;position:relative;width:min(230px,58vw);height:3px;margin-top:26px;border-radius:99px;overflow:hidden}',
  '.ax-splash__bar::before,.ax-splash__bar i{content:"";position:absolute;inset:0;background:var(--ax-ink)}',
  '.ax-splash__bar::before{opacity:.16}',
  '.ax-splash__bar i{transform-origin:left;animation:axBar 2.75s linear both}',
  '.ax-splash__credit{position:absolute;left:0;right:0;bottom:max(24px,env(safe-area-inset-bottom));text-align:center;font-family:"Lato",system-ui,Arial,sans-serif;font-size:13px;font-weight:500;letter-spacing:.03em;animation:axUp .6s ease .5s both}',
  '.ax-splash__credit strong{font-weight:800}',
  '@keyframes axPop{from{opacity:0;transform:scale(.88)}to{opacity:1;transform:none}}',
  '@keyframes axUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
  '@keyframes axBar{from{transform:scaleX(0)}to{transform:scaleX(1)}}',
  '@media(prefers-reduced-motion:reduce){.ax-splash,.ax-splash *{animation:none!important;transition:none!important}}',
].join('\n');

// Runs before anything is painted: applies the saved theme, switches the splash on and keeps hold of the
// install event (it can fire before React is ready). If the app never boots, the splash lets go after 9s.
export const BOOT_SCRIPT = `(function(d,w){var r=d.documentElement;r.classList.add('ax-booting');try{if(localStorage.getItem('archivum_theme')==='dark')r.classList.add('dark')}catch(e){}try{var a=localStorage.getItem('archivum_accent');var m=a==='tangerine'||a==='ink-wash'||a==='golden-taupe'?'smoky-ink':a==='berry'||a==='cherry-blossom'?'soft-pink':a==='ocean'?'crimson-veil':a;if(${JSON.stringify(ACCENT_IDS)}.indexOf(m)>-1)r.setAttribute('data-accent',m)}catch(e){}w.addEventListener('beforeinstallprompt',function(e){e.preventDefault();w.__axInstall=e});setTimeout(function(){if(r.classList.contains('ax-booting')){w.__axBootTimedOut=true;r.classList.remove('ax-booting')}},9000)})(document,window);`;

import type { SVGProps } from 'react';

/**
 * ARCHIVUM's own icon set. Plain SVG with CSS-only animation (no JS, no libraries):
 * parts of each icon move when the surrounding link/button is hovered, pressed or active.
 * Same props as lucide icons (className, size, strokeWidth) so they drop in anywhere.
 * Add `live` for a continuous loop on decorative icons. Motion is switched off for reduced-motion users.
 */
type IconProps = Omit<SVGProps<SVGSVGElement>, 'ref'> & { size?: number | string; strokeWidth?: number | string; live?: boolean };

function Base({ children, size = 24, strokeWidth = 2, live, className, ...rest }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"
      className={`aic${live ? ' aic-live' : ''}${className ? ` ${className}` : ''}`} {...rest}>{children}</svg>
  );
}

export const AHome = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
  </Base>
);

export const ABook = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 6.5v14" />
    <path d="M12 6.5C10.5 5 8 4.2 4 4.2v13.6c4 0 6.5.8 8 2.7" />
    <path className="aic-page" d="M12 6.5C13.5 5 16 4.2 20 4.2v13.6c-4 0-6.5.8-8 2.7" />
  </Base>
);

export const AFile = (p: IconProps) => (
  <Base {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
    <path className="aic-line aic-l1" pathLength={1} d="M9 13h6" />
    <path className="aic-line aic-l2" pathLength={1} d="M9 17h4" />
  </Base>
);

export const ABookmark = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <Base {...p}>
    <path className="aic-mark" d="M6.5 3.5h11v17L12 16.8 6.5 20.5z" fill={filled ? 'currentColor' : undefined} />
  </Base>
);

export const ABookmarkCheck = (p: IconProps) => (
  <Base {...p}>
    <path className="aic-mark" d="M6.5 3.5h11v17L12 16.8 6.5 20.5z" />
    <path className="aic-line aic-l1" pathLength={1} d="m9.5 10 1.8 1.8L15 8.2" />
  </Base>
);

export const AInfo = (p: IconProps) => (
  <Base {...p}>
    <circle className="aic-ring" cx="12" cy="12" r="9" />
    <path d="M12 11v5.2" />
    <path className="aic-dot" d="M12 7.8h.01" strokeWidth={3} />
  </Base>
);

export const ABulb = (p: IconProps) => (
  <Base {...p}>
    <path className="aic-glow" d="M12 4a6 6 0 0 0-3.9 10.5c.7.6 1.1 1.3 1.1 2.5h5.6c0-1.2.4-1.9 1.1-2.5A6 6 0 0 0 12 4z" />
    <path d="M9.5 19.6h5M10.5 22h3" />
    <path className="aic-rays" d="M12 .8v1.2M4.6 3.6l.9.9M19.4 3.6l-.9.9" />
  </Base>
);

export const AUsers = (p: IconProps) => (
  <Base {...p}>
    <g className="aic-u2"><circle cx="17" cy="8.5" r="2.6" /><path d="M16.5 14.2c2.9.2 4.5 1.8 4.5 4.3" /></g>
    <g className="aic-u1"><circle cx="9.5" cy="8" r="3.3" /><path d="M3 20c0-3.4 2.9-5.4 6.5-5.4S16 16.6 16 20" /></g>
  </Base>
);

export const AChat = (p: IconProps) => (
  <Base {...p}>
    <path d="M20.5 12a8 8 0 0 1-11.6 7.1L4 20.2l1.2-4.4A8 8 0 1 1 20.5 12z" />
    <path className="aic-d aic-d1" d="M8.6 12h.01" strokeWidth={2.6} />
    <path className="aic-d aic-d2" d="M12 12h.01" strokeWidth={2.6} />
    <path className="aic-d aic-d3" d="M15.4 12h.01" strokeWidth={2.6} />
  </Base>
);

export const ASearch = (p: IconProps) => (
  <Base {...p}>
    <g className="aic-lens"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m20.5 20.5-5.4-5.4" /></g>
  </Base>
);

export const AUpload = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 15.5v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    <g className="aic-up"><path d="M12 16V4.5" /><path d="m7.5 9 4.5-4.5L16.5 9" /></g>
  </Base>
);

export const ASend = (p: IconProps) => (
  <Base {...p}>
    <g className="aic-fly"><path d="M21 3 10.5 13.5" /><path d="M21 3l-6.5 18-4-7.5L3 9.5z" /></g>
  </Base>
);

export const AHeart = (p: IconProps) => (
  <Base {...p}>
    <path className="aic-beat" d="M12 20.5s-8-4.8-8-10.8A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 2.7c0 6-8 10.8-8 10.8z" />
  </Base>
);

export const ATrophy = (p: IconProps) => (
  <Base {...p}>
    <g className="aic-cup">
      <path d="M7.5 4h9v5.2a4.5 4.5 0 0 1-9 0z" />
      <path d="M7.5 6H4.5v1.3a3.2 3.2 0 0 0 3.2 3.2M16.5 6h3v1.3a3.2 3.2 0 0 1-3.2 3.2" />
      <path d="M12 13.7v4M8.5 20.5h7M9.7 17.7h4.6" />
    </g>
    <path className="aic-star" d="M12 6.2v2.4M10.8 7.4h2.4" strokeWidth={1.6} />
  </Base>
);

export const ASparkles = (p: IconProps) => (
  <Base {...p}>
    <path className="aic-tw1" d="M10.5 4.5 12 9.2l4.7 1.5-4.7 1.5-1.5 4.7L9 12.2 4.3 10.7 9 9.2z" />
    <path className="aic-tw2" d="M18.5 3v4M16.5 5h4M18 15.5v4M16 17.5h4" strokeWidth={1.6} />
  </Base>
);

export const AMail = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="5.5" width="18" height="13.5" rx="2.4" />
    <path className="aic-flap" d="M3.4 7.6 12 13.6l8.6-6" />
  </Base>
);

export const ACamera = (p: IconProps) => (
  <Base {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle className="aic-lensring" cx="12" cy="12" r="3.8" />
    <path className="aic-flash" d="M17.3 6.8h.01" strokeWidth={2.6} />
  </Base>
);

export const AArrowRight = (p: IconProps) => (
  <Base {...p}><g className="aic-nx"><path d="M4.5 12h15" /><path d="m13.5 6 6 6-6 6" /></g></Base>
);

export const AArrowUpRight = (p: IconProps) => (
  <Base {...p}><g className="aic-nxy"><path d="M7 17 17 7" /><path d="M8.5 7H17v8.5" /></g></Base>
);

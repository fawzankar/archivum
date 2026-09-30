import React from 'react';

/* Theme-aware hero artwork. Every colour comes from CSS variables (see hero-v2.css),
   so switching accent recolours the whole scene. Strokes are slightly irregular and
   hand-placed so it reads as sketched rather than generated. */
export default function HeroScene() {
  return (
    <div className="hx-scene" aria-hidden="true">
      <span className="hx-wash hx-wash-a" />
      <span className="hx-wash hx-wash-b" />
      <span className="hx-wash hx-wash-c" />
      <span className="hx-grain" />

      <svg className="hx-waves" viewBox="0 0 1200 220" preserveAspectRatio="none">
        <path className="hx-wave hx-wave-1" d="M0 120C140 70 260 60 400 100s290 90 430 40 260-60 370-20v100H0Z" />
        <path className="hx-wave hx-wave-2" d="M0 160C170 120 300 110 470 145s300 60 460 20 200-40 270-25v80H0Z" />
        <path className="hx-wave hx-wave-3" d="M0 195C200 165 330 170 520 190s330 20 680-15v45H0Z" />
      </svg>

      <svg className="hx-d hx-d-root" viewBox="0 0 100 64" fill="none">
        <path d="M10 36l7 12 11-34h40" />
        <path d="M46 24l16 20M62 24 46 44" />
        <path className="hx-fill-soft" d="M76 50h9" />
      </svg>

      <svg className="hx-d hx-d-star hx-warm" viewBox="0 0 64 64" fill="none">
        <path d="M32 7l6 17 18 1-14 11 5 18-15-10-15 10 5-18L8 25l18-1 6-17Z" />
      </svg>

      <svg className="hx-d hx-d-plane" viewBox="0 0 72 64" fill="none">
        <path className="hx-plane-body" d="M6 28 64 6 44 58 33 39 6 28Z" />
        <path d="m33 39 31-33" />
      </svg>

      <svg className="hx-d hx-d-trail" viewBox="0 0 220 90" fill="none">
        <path className="hx-trail" d="M4 82c18-8 34-6 30-20-3-11-18-9-16 2 2 12 38 16 84-4 46-20 70-38 96-56" />
      </svg>

      <svg className="hx-d hx-d-pyramid" viewBox="0 0 76 68" fill="none">
        <path d="M38 5 70 62H6L38 5Z" />
        <path className="hx-dash" d="M38 5v57M6 62l32-14 32 14" />
      </svg>

      <svg className="hx-d hx-d-pencil hx-warm" viewBox="0 0 48 96" fill="none">
        <path d="M14 14 24 4l10 10v54L24 90 14 68V14Z" />
        <path d="M14 68h20M14 24h20M24 90v-14" />
      </svg>

      <svg className="hx-d hx-d-book" viewBox="0 0 110 80" fill="none">
        <path d="M6 16c22-8 36-4 49 8v50c-14-10-30-12-49-6V16ZM104 16c-22-8-36-4-49 8v50c14-10 30-12 49-6V16Z" />
        <path className="hx-soft" d="M16 30c9-2 18 0 28 6M16 42c9-2 18 0 28 6M94 30c-9-2-18 0-28 6M94 42c-9-2-18 0-28 6" />
      </svg>

      <svg className="hx-d hx-d-atom" viewBox="0 0 70 70" fill="none">
        <ellipse cx="35" cy="35" rx="28" ry="10" />
        <ellipse cx="35" cy="35" rx="28" ry="10" transform="rotate(60 35 35)" />
        <ellipse cx="35" cy="35" rx="28" ry="10" transform="rotate(120 35 35)" />
        <circle className="hx-warm-fill" cx="35" cy="35" r="4.5" />
      </svg>

      <svg className="hx-d hx-d-leaf hx-d-leaf-l" viewBox="0 0 80 90"><path d="M40 88C38 60 20 44 6 34c26-2 40 12 44 34 2-22 12-40 28-52-2 30-12 50-38 72Z" /></svg>
      <svg className="hx-d hx-d-leaf hx-d-leaf-r" viewBox="0 0 80 90"><path d="M40 88C38 60 20 44 6 34c26-2 40 12 44 34 2-22 12-40 28-52-2 30-12 50-38 72Z" /></svg>

      <i className="hx-dot hx-dot-1" /><i className="hx-dot hx-dot-2" /><i className="hx-dot hx-dot-3" /><i className="hx-dot hx-dot-4" />
      <b className="hx-spark hx-spark-1" /><b className="hx-spark hx-spark-2" /><b className="hx-spark hx-spark-3" />
    </div>
  );
}

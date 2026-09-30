import React from 'react';

/**
 * Static Archivum doodle layer + animated paper waves.
 * The illustrations stay still; only the bottom waves move.
 */
export default function HeroScene() {
  return (
    <div className="hx-scene" aria-hidden="true">
      <span className="hx-wash hx-wash-a" />
      <span className="hx-wash hx-wash-b" />
      <span className="hx-wash hx-wash-c" />
      <span className="hx-grain" />

      {/* Archive / study doodles: deliberately static, hand-drawn SVGs. */}
      <svg className="hx-d hx-d-stack" viewBox="0 0 110 90">
        <path d="M14 26 65 15l30 14-50 12-31-15Z" />
        <path d="M14 26v34l31 15V41M95 29v32L45 75" />
        <path className="hx-soft" d="m28 32 31-7M27 43l31-7M27 55l31-7" />
      </svg>

      <svg className="hx-d hx-d-bookmark" viewBox="0 0 54 72">
        <path d="M9 7h36v57L27 52 9 64V7Z" />
        <path className="hx-soft" d="M17 17h20M17 27h20" />
      </svg>

      <svg className="hx-d hx-d-cap" viewBox="0 0 90 66">
        <path d="m7 25 38-17 38 17-38 17L7 25Z" />
        <path d="M20 32v16c14 12 36 12 50 0V32M83 26v25" />
        <circle className="hx-warm-fill" cx="83" cy="54" r="3" />
      </svg>

      <svg className="hx-d hx-d-file" viewBox="0 0 78 92">
        <path d="M13 5h34l18 18v64H13V5Z" />
        <path d="M47 5v19h18M24 40h30M24 51h30M24 62h21" />
        <path className="hx-soft" d="M24 73h13" />
      </svg>

      <svg className="hx-d hx-d-pencil" viewBox="0 0 54 98">
        <path d="m17 12 11-7 12 18-10 56-14 13-8-17 9-56Z" />
        <path d="m8 75 14 17M15 19l17 18M11 31l17 18" />
      </svg>

      <svg className="hx-d hx-d-magnify" viewBox="0 0 76 76">
        <circle cx="31" cy="31" r="20" />
        <path d="m46 46 22 22" />
        <path className="hx-soft" d="M22 31c0-6 4-11 10-14" />
      </svg>

      <svg className="hx-d hx-d-pages" viewBox="0 0 96 72">
        <path d="M11 14h59l15 12H26L11 14Z" />
        <path d="M26 26v31l59-2V26M11 14v31l15 12" />
        <path className="hx-soft" d="M37 36h34M37 46h25" />
      </svg>

      <svg className="hx-d hx-d-check" viewBox="0 0 58 58">
        <circle cx="29" cy="29" r="22" />
        <path d="m18 29 7 7 15-17" />
      </svg>

      <span className="hx-dot hx-dot-1" />
      <span className="hx-dot hx-dot-2" />
      <span className="hx-dot hx-dot-3" />
      <b className="hx-spark hx-spark-1" />
      <b className="hx-spark hx-spark-2" />
    </div>
  );
}

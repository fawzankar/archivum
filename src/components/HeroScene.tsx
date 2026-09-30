import React from 'react';

/** Static study doodles for the hero. Only the greeting hand animates. */
export default function HeroScene() {
  return (
    <div className="hx-scene" aria-hidden="true">
      <span className="hx-wash hx-wash-a" />
      <span className="hx-wash hx-wash-b" />
      <span className="hx-wash hx-wash-c" />
      <span className="hx-grain" />

      {/* Hand-drawn study doodles — deliberately kept to the right side. */}
      <div className="hx-equation hx-equation-root">√x</div>
      <div className="hx-equation hx-equation-energy">E=mc²</div>

      {/* Colorful pencil doodle inspired by the supplied reference. */}
      <svg className="hx-d hx-d-pencil-ref" viewBox="0 0 180 180">
        <g transform="rotate(-36 90 90)">
          <path className="pencil-eraser" d="M55 14h70c9 0 16 7 16 16v18H39V30c0-9 7-16 16-16Z" />
          <path className="pencil-ferrule" d="M39 48h102v24H39z" />
          <path className="pencil-body" d="M43 72h94v74l-25 26H68l-25-26V72Z" />
          <path className="pencil-highlight" d="M61 77h13v64H61z" />
          <path className="pencil-wood" d="m68 146 22 26 22-26Z" />
          <path className="pencil-lead" d="m84 165 6 7 6-7-6-12Z" />
          <path className="pencil-line" d="M55 86h67M55 103h67M55 120h67" />
          <path className="pencil-ferrule-line" d="M52 55h76M52 64h76" />
        </g>
        <path className="pencil-swoop" d="M124 151c19 11 26 26 14 37-12 11-34 5-37-11-2-10 7-17 17-13 16 6 29 26 45 19 11-5 15-19 9-31" />
      </svg>

      {/* Graduation cap, brought back as requested. */}
      <svg className="hx-d hx-d-cap-ref" viewBox="0 0 150 110">
        <path d="M14 42 75 12l61 30-61 30-61-30Z" />
        <path d="M39 56v25c22 18 50 18 72 0V56" />
        <path d="M136 43v39" />
        <circle cx="136" cy="85" r="3" />
      </svg>

      <svg className="hx-d hx-d-paper-ref" viewBox="0 0 90 105">
        <path d="M15 7h39l21 21v70H15V7Z" />
        <path d="M54 7v23h21M28 47h35M28 60h29M28 73h22" />
      </svg>
    </div>
  );
}

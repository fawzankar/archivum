import React from 'react';

/** Static Archivum illustration layer. Only the paper-like waves and greeting hand animate. */
export default function HeroScene() {
  return (
    <div className="hx-scene" aria-hidden="true">
      <span className="hx-wash hx-wash-a" />
      <span className="hx-wash hx-wash-b" />
      <span className="hx-wash hx-wash-c" />
      <span className="hx-grain" />

      {/* Fresh, app-specific study doodles — intentionally static. */}
      <div className="hx-equation hx-equation-a">√x</div>
      <div className="hx-equation hx-equation-b">E=mc²</div>

      <svg className="hx-d hx-d-pencil-new" viewBox="0 0 80 150">
        <path d="M31 7 49 4l17 102-19 36-14-32L31 7Z" />
        <path d="m33 23 29-5M36 40l29-5M39 57l29-5M42 74l29-5M45 91l20-4" />
        <path d="m47 142 2-31 14-3 3 17-19 17Z" />
        <path className="hx-soft" d="m31 7 18-3 4 24-18 3Z" />
      </svg>

      <svg className="hx-d hx-d-folder" viewBox="0 0 110 82">
        <path d="M7 18h35l10 12h51v43H7V18Z" />
        <path d="M7 30h96" />
        <path className="hx-soft" d="M18 45h52M18 56h38" />
      </svg>

      <svg className="hx-d hx-d-paper" viewBox="0 0 78 92">
        <path d="M13 5h34l18 18v64H13V5Z" />
        <path d="M47 5v19h18M24 41h30M24 52h24M24 63h18" />
        <path className="hx-soft" d="M24 74h11" />
      </svg>

      <svg className="hx-d hx-d-bookmark-new" viewBox="0 0 52 72">
        <path d="M9 7h34v57L26 51 9 64V7Z" />
        <path className="hx-soft" d="M17 19h18M17 29h18" />
      </svg>
    </div>
  );
}

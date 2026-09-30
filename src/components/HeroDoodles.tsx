'use client';

import React from 'react';

function Icon({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={`hero-doodle ${className}`} aria-hidden="true">{children}</span>;
}

export default function HeroDoodles() {
  return <div className="hero-doodles" aria-hidden="true">
    <Icon className="hero-doodle-formula">
      <svg viewBox="0 0 100 64" fill="none"><path d="M8 15h32M8 49h32" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/><path d="M16 39 27 18l10 21" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/><path d="m57 14 12 12-12 12M72 38h18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><circle cx="86" cy="14" r="3" fill="currentColor"/></svg>
    </Icon>
    <Icon className="hero-doodle-star">
      <svg viewBox="0 0 64 64" fill="none"><path d="M32 6l5.8 18.2L56 30l-18.2 5.8L32 54l-5.8-18.2L8 30l18.2-5.8L32 6Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/></svg>
    </Icon>
    <Icon className="hero-doodle-plane">
      <svg viewBox="0 0 72 64" fill="none"><path d="M8 30 62 7 43 57l-9-19L8 30Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/><path d="m34 38 11-13" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></svg>
    </Icon>
    <Icon className="hero-doodle-triangle">
      <svg viewBox="0 0 70 64" fill="none"><path d="M35 5 62 57H8L35 5Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/><path d="M35 5v52M8 57 46 33M62 57 24 33" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
    </Icon>
    <Icon className="hero-doodle-pencil">
      <svg viewBox="0 0 56 74" fill="none"><path d="m17 62 7-20L43 23l10 10-19 19-17 10Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/><path d="m31 30 10 10M39 20l10 10-6 6-10-10 6-6Z" stroke="currentColor" strokeWidth="4"/><path d="m17 62 3-10 7 7-10 3Z" fill="currentColor"/></svg>
    </Icon>
    <Icon className="hero-doodle-book">
      <svg viewBox="0 0 86 68" fill="none"><path d="M8 14c15-5 27-1 35 7v37c-10-7-21-10-35-5V14ZM78 14c-15-5-27-1-35 7v37c10-7 21-10 35-5V14Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/><path d="M17 25c7-2 13-1 20 3M69 25c-7-2-13-1-20 3" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
    </Icon>
    <Icon className="hero-doodle-spark hero-doodle-spark-a"><svg viewBox="0 0 40 40" fill="none"><path d="M20 3v10M20 27v10M3 20h10M27 20h10" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/></svg></Icon>
    <Icon className="hero-doodle-spark hero-doodle-spark-b"><svg viewBox="0 0 48 48" fill="none"><path d="M24 4v8M24 36v8M4 24h8M36 24h8M10 10l6 6M32 32l6 6M38 10l-6 6M16 32l-6 6" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round"/></svg></Icon>
    <Icon className="hero-doodle-atom">
      <svg viewBox="0 0 70 70" fill="none"><ellipse cx="35" cy="35" rx="28" ry="11" stroke="currentColor" strokeWidth="3"/><ellipse cx="35" cy="35" rx="28" ry="11" transform="rotate(60 35 35)" stroke="currentColor" strokeWidth="3"/><ellipse cx="35" cy="35" rx="28" ry="11" transform="rotate(120 35 35)" stroke="currentColor" strokeWidth="3"/><circle cx="35" cy="35" r="5" fill="currentColor"/></svg>
    </Icon>
  </div>;
}

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, Check } from 'lucide-react';
import { useStudentClass, type StudentClass } from './StudentClassContext';

const classes: { level: StudentClass; stage: string }[] = [
  { level: 9, stage: 'Secondary' },
  { level: 10, stage: 'Secondary' },
  { level: 11, stage: 'Sr. Secondary' },
  { level: 12, stage: 'Sr. Secondary' },
];

export default function FirstLaunch() {
  const { studentClass, displayName, setStudentClass, setDisplayName } = useStudentClass();
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState(displayName);
  const [selectedClass, setSelectedClass] = useState<StudentClass | null>(studentClass);

  useEffect(() => setName(displayName), [displayName]);
  useEffect(() => setSelectedClass(studentClass), [studentClass]);

  useEffect(() => {
    if (pathname !== '/') {
      setVisible(false);
      document.documentElement.classList.remove('profile-onboarding-active');
      return;
    }
    const completed = window.localStorage.getItem('archivum_profile_completed') === '1';
    const shouldShow = !completed || !studentClass;
    setVisible(shouldShow);
    document.documentElement.classList.toggle('profile-onboarding-active', shouldShow);
    return () => document.documentElement.classList.remove('profile-onboarding-active');
  }, [pathname, studentClass, displayName]);

  const heading = useMemo(() => {
    if (!selectedClass) return 'Pick your class';
    if (!name.trim()) return 'And your name?';
    return `Welcome, ${name.trim().split(' ')[0]}`;
  }, [selectedClass, name]);

  if (!visible) return null;

  const canFinish = Boolean(selectedClass && name.trim());
  const step = !selectedClass ? 0 : !name.trim() ? 1 : 2;

  const finish = () => {
    if (!selectedClass || !name.trim()) return;
    setStudentClass(selectedClass);
    setDisplayName(name);
    window.localStorage.setItem('archivum_profile_completed', '1');
    router.replace(`/?class=${selectedClass}`, { scroll: false });
    setVisible(false);
    document.documentElement.classList.remove('profile-onboarding-active');
  };

  return (
    <div className="ob" role="dialog" aria-modal="true" aria-labelledby="ob-title">
      <span className="ob-orb ob-orb-a" /><span className="ob-orb ob-orb-b" />
      <form className="ob-card" onSubmit={e => { e.preventDefault(); finish(); }}>
        <div className="ob-top">
          <span className="ob-brand">ARCHIVUM</span>
          <span className="ob-steps" aria-hidden="true">
            {[0, 1, 2].map(i => <i key={i} className={i <= step ? 'on' : ''} />)}
          </span>
        </div>

        <h2 id="ob-title" key={heading} className="ob-title">{heading}</h2>

        <div className="ob-classes" role="radiogroup" aria-label="Choose your class" data-picked={selectedClass ?? ''}>
          {classes.map(({ level, stage }, i) => {
            const on = selectedClass === level;
            return (
              <button key={level} type="button" role="radio" aria-checked={on} onClick={() => setSelectedClass(level)}
                className={`ob-class${on ? ' is-on' : ''}`} style={{ ['--d' as string]: `${120 + i * 60}ms` }}>
                <span className="ob-class-check"><Check strokeWidth={3} /></span>
                <small>Class</small>
                <strong>{level}</strong>
                <em>{stage}</em>
              </button>
            );
          })}
        </div>

        <label className={`ob-field${name ? ' has-value' : ''}`}>
          <input value={name} onChange={e => setName(e.target.value.slice(0, 40))} maxLength={40} autoComplete="given-name" aria-label="Your name" placeholder=" " />
          <span className="ob-float">Your name</span>
          <span className="ob-count">{name.length ? `${name.length}/40` : ''}</span>
        </label>

        <button type="submit" disabled={!canFinish} className="ob-go">
          <span>Enter ARCHIVUM</span><ArrowRight />
        </button>
        <p className="ob-note">Stays on this device. Change it anytime from the menu.</p>
      </form>
    </div>
  );
}

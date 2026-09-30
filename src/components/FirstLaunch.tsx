'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, Check, UserRound, GraduationCap } from 'lucide-react';
import { useStudentClass, type StudentClass } from './StudentClassContext';
import { subjectsForClass } from '@/lib/subjects';
import Art from './Art';

const classes: StudentClass[] = [9, 10, 11, 12];

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
    if (!selectedClass) return 'Choose your class.';
    if (!name.trim()) return 'What should we call you?';
    return 'Ready when you are.';
  }, [selectedClass, name]);

  if (!visible) return null;

  const finish = () => {
    if (!selectedClass) return;
    setStudentClass(selectedClass);
    setDisplayName(name);
    window.localStorage.setItem('archivum_profile_completed', '1');
    router.replace(`/?class=${selectedClass}`, { scroll: false });
    setVisible(false);
    document.documentElement.classList.remove('profile-onboarding-active');
  };

  const canFinish = Boolean(selectedClass && name.trim());

  return (
    <div className="profile-onboarding" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <div className="profile-onboarding-panel">
        <div className="profile-onboarding-brand">
          <span className="brand-mark"><span className="archivum-css-logo" /></span>
          <span>ARCHIVUM</span>
        </div>

        <div className="profile-onboarding-copy">
          
          <h2 id="welcome-title" className="font-display">{heading}</h2>
          <p>Pick your class and tell us your name. We will use that to keep the archive focused on your study material.</p>
        </div>

        <div className="profile-step">
          <div className="profile-step-label"><GraduationCap /> <span>Your class</span></div>
          <div className="cls-grid" role="radiogroup" aria-label="Choose your class">
            {classes.map(level => {
              const subs = subjectsForClass(level);
              const selected = selectedClass === level;
              return (
                <button key={level} type="button" role="radio" aria-checked={selected} onClick={() => setSelectedClass(level)} className={`cls-card cls-t${level}${selected ? ' selected' : ''}`} style={{ '--cls-delay': `${(level - 9) * 55}ms` } as React.CSSProperties}>
                  <span className="cls-check"><Check /></span>
                  <span className="cls-label">Class</span>
                  <strong className="cls-num">{level}</strong>
                  <span className="cls-stage">{level <= 10 ? 'Secondary' : 'Senior Secondary'}</span>
                  <span className="cls-subjects" aria-hidden="true">
                    {subs.slice(0, 3).map(sub => <span key={sub} className="cls-sub"><Art name={sub} /></span>)}
                    {subs.length > 3 && <span className="cls-more">+{subs.length - 3}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="profile-step">
          <div className="profile-step-label"><UserRound /> <span>Your name</span></div>
          <div className="profile-name-field">
            <input value={name} onChange={e => setName(e.target.value.slice(0, 40))} maxLength={40} placeholder="What should we call you?" autoComplete="given-name" />
            <span>{name.length}/40</span>
          </div>
          <p className="profile-private-note">Used only on this device to personalise the app.</p>
        </div>

        <button type="button" disabled={!canFinish} onClick={finish} className="profile-continue">
          Enter ARCHIVUM <ArrowRight />
        </button>
      </div>
    </div>
  );
}

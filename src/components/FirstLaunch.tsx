'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, Check, UserRound, GraduationCap } from 'lucide-react';
import { useStudentClass, type StudentClass } from './StudentClassContext';

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
    if (pathname !== '/') return setVisible(false);
    const completed = window.localStorage.getItem('archivum_profile_completed') === '1';
    setVisible(!completed || !studentClass);
  }, [pathname, studentClass, displayName]);

  const heading = useMemo(() => {
    if (!selectedClass) return 'Choose your class.';
    if (!name.trim()) return 'Add a name, if you like.';
    return 'Your desk is ready.';
  }, [selectedClass, name]);

  if (!visible) return null;

  const finish = () => {
    if (!selectedClass) return;
    setStudentClass(selectedClass);
    setDisplayName(name);
    window.localStorage.setItem('archivum_profile_completed', '1');
    router.replace(`/?class=${selectedClass}`, { scroll: false });
    setVisible(false);
  };

  const canFinish = Boolean(selectedClass);

  return (
    <div className="profile-onboarding" role="dialog" aria-modal="true" aria-labelledby="welcome-title">
      <div className="profile-onboarding-panel">
        <div className="profile-onboarding-brand">
          <span className="brand-mark"><span className="archivum-css-logo" /></span>
          <span>ARCHIVUM</span>
        </div>

        <div className="profile-onboarding-copy">
          <span className="eyebrow">A quieter archive, made for you</span>
          <h2 id="welcome-title" className="font-display">{heading}</h2>
          <p>Tell us the basics once. ARCHIVUM will remember them on this device and shape the archive around you.</p>
        </div>

        <div className="profile-step">
          <div className="profile-step-label"><GraduationCap /> <span>01 / Class</span></div>
          <div className="profile-class-grid">
            {classes.map(level => (
              <button key={level} type="button" onClick={() => setSelectedClass(level)} className={selectedClass === level ? 'selected' : ''}>
                <strong>{level}</strong>
                <span>Class {level}</span>
                {selectedClass === level && <Check />}
              </button>
            ))}
          </div>
        </div>

        <div className="profile-step">
          <div className="profile-step-label"><UserRound /> <span>02 / Your name</span></div>
          <div className="profile-name-field">
            <input value={name} onChange={e => setName(e.target.value.slice(0, 40))} maxLength={40} placeholder="What should we call you?" autoComplete="given-name" />
            <span>{name.length}/40</span>
          </div>
          <p className="profile-private-note">Optional. It only changes how ARCHIVUM greets you on this device.</p>
        </div>

        <button type="button" disabled={!canFinish} onClick={finish} className="profile-continue">
          {name.trim() ? 'Enter my archive' : 'Enter without a name'} <ArrowRight />
        </button>
      </div>
    </div>
  );
}

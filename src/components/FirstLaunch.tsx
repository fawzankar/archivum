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

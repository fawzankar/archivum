'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, Check, GraduationCap, UserRound } from 'lucide-react';
import Art from './Art';
import { subjectsForClass } from '@/lib/subjects';
import { useStudentClass, type StudentClass } from './StudentClassContext';

const classes: { level: StudentClass; stage: string }[] = [
  { level: 9, stage: 'Secondary' },
  { level: 10, stage: 'Secondary' },
  { level: 11, stage: 'Senior Secondary' },
  { level: 12, stage: 'Senior Secondary' },
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
    if (!selectedClass) return 'Which class are you in?';
    if (!name.trim()) return 'Nice. What’s your name?';
    return `Good to meet you, ${name.trim().split(' ')[0]}!`;
  }, [selectedClass, name]);

  if (!visible) return null;

  const canFinish = Boolean(selectedClass && name.trim());
  const subjects = selectedClass ? subjectsForClass(selectedClass) : [];

  const finish = () => {
    if (!selectedClass || !name.trim()) return;
    setStudentClass(selectedClass);
    setDisplayName(name.trim());
    window.localStorage.setItem('archivum_profile_completed', '1');
    router.replace(`/?class=${selectedClass}`, { scroll: false });
    setVisible(false);
    document.documentElement.classList.remove('profile-onboarding-active');
  };

  return (
    <div className="profile-onboarding" role="dialog" aria-modal="true" aria-labelledby="ob-title">
      <form className="profile-onboarding-panel" onSubmit={e => { e.preventDefault(); finish(); }}>
        <div className="profile-onboarding-brand">
          <span className="brand-mark"><span className="archivum-css-logo">A</span></span>
          <span>ARCHIVUM</span>
        </div>

        <div className="profile-onboarding-copy">
          <h2 id="ob-title" key={heading}>{heading}</h2>
          <p>Two quick things and you’re in. We’ll use them to show you the right material and say hello properly.</p>
        </div>

        <section className="profile-step" aria-labelledby="class-step-label">
          <div className="profile-step-label" id="class-step-label">
            <GraduationCap aria-hidden="true" />
            <span>Your class</span>
          </div>

          <div className="cls-grid" role="radiogroup" aria-label="Choose your class">
            {classes.map(({ level, stage }, i) => {
              const on = selectedClass === level;
              const cardSubjects = subjectsForClass(level);
              const previewSubjects = cardSubjects.slice(0, 3);
              const more = Math.max(0, cardSubjects.length - previewSubjects.length);
              return (
                <button
                  key={level}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setSelectedClass(level)}
                  className={`cls-card${on ? ' selected' : ''}`}
                  style={{ ['--card-delay' as string]: `${i * 70}ms` }}
                >
                  <span className="cls-check" aria-hidden="true"><Check /></span>
                  <span className="cls-label">Class</span>
                  <span className="cls-num">{level}</span>
                  <span className="cls-stage">{stage}</span>
                  <span className="cls-subjects" aria-hidden="true">
                    {previewSubjects.map(subject => (
                      <span className="cls-sub" key={subject} title={subject}>
                        <Art name={subject} />
                      </span>
                    ))}
                    {more > 0 && <span className="cls-more">+{more}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="profile-step profile-name-step" aria-labelledby="name-step-label">
          <div className="profile-step-label" id="name-step-label">
            <UserRound aria-hidden="true" />
            <span>Your name</span>
          </div>
          <label className="profile-name-field">
            <input
              value={name}
              onChange={e => setName(e.target.value.slice(0, 40))}
              maxLength={40}
              autoComplete="given-name"
              aria-label="Your name"
              placeholder="What should we call you?"
            />
            <span>{name.length}/40</span>
          </label>
          <p className="profile-private-note">Stays on this device. We never send it anywhere.</p>
        </section>

        <button type="submit" disabled={!canFinish} className="profile-continue">
          <span>Let’s go</span><ArrowRight />
        </button>
      </form>
    </div>
  );
}

'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type StudentClass = 9 | 10 | 11 | 12;

interface StudentClassContextValue {
  studentClass: StudentClass | null;
  displayName: string;
  setStudentClass: (value: StudentClass) => void;
  setDisplayName: (value: string) => void;
  resetStudentProfile: () => void;
  resetStudentClass: () => void;
  isChangingClass: boolean;
}

const StudentClassContext = createContext<StudentClassContextValue | null>(null);

export function StudentClassProvider({ children }: { children: React.ReactNode }) {
  const [studentClass, setStudentClassState] = useState<StudentClass | null>(null);
  const [displayName, setDisplayNameState] = useState('');

  useEffect(() => {
    const urlClass = Number(new URLSearchParams(window.location.search).get('class') || '');
    const stored = Number(localStorage.getItem('archivum_student_class'));
    const storedName = (localStorage.getItem('archivum_display_name') || '').trim();
    const initial = [9, 10, 11, 12].includes(urlClass)
      ? urlClass
      : ([9, 10, 11, 12].includes(stored) ? stored : null);

    if (initial) {
      setStudentClassState(initial as StudentClass);
      localStorage.setItem('archivum_student_class', String(initial));
      document.cookie = `archivum_class=${initial};path=/;max-age=31536000;samesite=lax`;
    }
    setDisplayNameState(storedName);

    const syncFromStorage = (event: StorageEvent) => {
      if (event.key === 'archivum_student_class') {
        const next = Number(event.newValue);
        setStudentClassState([9, 10, 11, 12].includes(next) ? next as StudentClass : null);
      }
      if (event.key === 'archivum_display_name') setDisplayNameState((event.newValue || '').trim());
    };
    window.addEventListener('storage', syncFromStorage);
    return () => window.removeEventListener('storage', syncFromStorage);
  }, []);

  const setStudentClass = (value: StudentClass) => {
    setStudentClassState(value);
    localStorage.setItem('archivum_student_class', String(value));
    document.cookie = `archivum_class=${value};path=/;max-age=31536000;samesite=lax`;
    window.dispatchEvent(new CustomEvent('archivum:class-change', { detail: { level: value } }));
  };

  const setDisplayName = (value: string) => {
    const clean = value.trim().slice(0, 40);
    setDisplayNameState(clean);
    if (clean) localStorage.setItem('archivum_display_name', clean);
    else localStorage.removeItem('archivum_display_name');
    window.dispatchEvent(new CustomEvent('archivum:name-change', { detail: { name: clean } }));
  };

  const resetStudentProfile = () => {
    setStudentClassState(null);
    setDisplayNameState('');
    localStorage.removeItem('archivum_student_class');
    localStorage.removeItem('archivum_display_name');
    localStorage.removeItem('archivum_profile_completed');
    document.cookie = 'archivum_class=;path=/;max-age=0;samesite=lax';
  };

  const value = useMemo(
    () => ({
      studentClass,
      displayName,
      setStudentClass,
      setDisplayName,
      resetStudentProfile,
      resetStudentClass: resetStudentProfile,
      isChangingClass: false,
    }),
    [studentClass, displayName]
  );

  return <StudentClassContext.Provider value={value}>{children}</StudentClassContext.Provider>;
}

export function useStudentClass() {
  const value = useContext(StudentClassContext);
  if (!value) throw new Error('useStudentClass must be used within StudentClassProvider');
  return value;
}

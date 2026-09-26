'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type StudentClass = 9 | 10 | 11 | 12;

interface StudentClassContextValue {
  studentClass: StudentClass | null;
  setStudentClass: (value: StudentClass) => void;
  resetStudentClass: () => void;
}

const StudentClassContext = createContext<StudentClassContextValue | null>(null);

export function StudentClassProvider({ children }: { children: React.ReactNode }) {
  const [studentClass, setStudentClassState] = useState<StudentClass | null>(null);
  const [isChangingClass, setIsChangingClass] = useState(false);

  useEffect(() => {
    const stored = Number(localStorage.getItem('archivum_student_class'));
    if ([9, 10, 11, 12].includes(stored)) setStudentClassState(stored as StudentClass);

    const syncFromStorage = (event: StorageEvent) => {
      if (event.key !== 'archivum_student_class') return;
      const next = Number(event.newValue);
      setStudentClassState([9, 10, 11, 12].includes(next) ? next as StudentClass : null);
    };
    window.addEventListener('storage', syncFromStorage);
    return () => window.removeEventListener('storage', syncFromStorage);
  }, []);

  const setStudentClass = (value: StudentClass) => {
    setStudentClassState(value);
    localStorage.setItem('archivum_student_class', String(value));
    document.cookie = `archivum_class=${value};path=/;max-age=31536000;samesite=lax`;
  };

  const resetStudentClass = () => {
    setStudentClassState(null);
    localStorage.removeItem('archivum_student_class');
    document.cookie = 'archivum_class=;path=/;max-age=0;samesite=lax';
  };

  const value = useMemo(() => ({ studentClass, setStudentClass, resetStudentClass }), [studentClass]);
  return <StudentClassContext.Provider value={value}>{children}</StudentClassContext.Provider>;
}

export function useStudentClass() {
  const value = useContext(StudentClassContext);
  if (!value) throw new Error('useStudentClass must be used within StudentClassProvider');
  return value;
}

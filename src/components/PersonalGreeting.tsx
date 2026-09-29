'use client';
import React from 'react';
import { useStudentClass } from './StudentClassContext';
export default function PersonalGreeting({ activeClass }: { activeClass: number }) {
  const { displayName } = useStudentClass();
  const name = displayName.trim() || 'there';
  return <div className="personal-greeting"><span>HELLO, {name.toUpperCase()}</span><b>CLASS {activeClass}</b></div>;
}

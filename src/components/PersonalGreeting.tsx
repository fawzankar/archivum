'use client';
import React from 'react';
import { useStudentClass } from './StudentClassContext';

export default function PersonalGreeting({ activeClass }: { activeClass: number }) {
  const { displayName } = useStudentClass();
  const name = displayName.trim() || 'there';
  return <div className="hm-hello"><h1>Hello,<br /><strong>{name}</strong></h1><span className="sr-only">Class {activeClass} notes and papers, all in one place.</span></div>;
}

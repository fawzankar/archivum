'use client';
import React from 'react';
import { useStudentClass } from './StudentClassContext';

export default function PersonalGreeting({ activeClass }: { activeClass: number }) {
  const { displayName } = useStudentClass();
  const name = displayName.trim() || 'there';
  return <div className="hm-hello"><h1>Hello <strong>{name}</strong> <span className="hm-wave" aria-hidden="true">👋</span></h1><span className="sr-only">Class {activeClass}</span></div>;
}

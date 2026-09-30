'use client';
import React from 'react';
import { useStudentClass } from './StudentClassContext';

export default function PersonalGreeting({ activeClass }: { activeClass: number }) {
  const { displayName } = useStudentClass();
  const name = displayName.trim() || 'there';
  return <div className="hx-hello"><h1><span className="hx-hello-light">Hello</span> <strong>{name}</strong> <span className="hx-wave" aria-hidden="true" role="img">👋</span></h1><span className="sr-only">Class {activeClass}</span></div>;
}

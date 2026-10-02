'use client';
import React from 'react';
import { useStudentClass } from './StudentClassContext';
function getGreeting(hour: number) { if (hour < 12) return 'Good morning'; if (hour < 17) return 'Good afternoon'; return 'Good evening'; }
export default function PersonalGreeting({ activeClass }: { activeClass: number }) {
  const { displayName } = useStudentClass();
  const name = displayName.trim() || 'there';
  return <div className="hx-hello"><h1><span className="hx-hello-light">{getGreeting(new Date().getHours())}</span><strong>{name}</strong><span className="hx-wave" aria-hidden="true" role="img">👋</span></h1><span className="sr-only">Class {activeClass}</span></div>;
}

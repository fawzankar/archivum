'use client';
import React from 'react';
import { useStudentClass } from './StudentClassContext';
export default function PersonalGreeting({ activeClass }: { activeClass: number }) {
  const { displayName } = useStudentClass();
  const name = displayName.trim() || 'there';
  return <>
    <h1 className="home-greeting-title">Hey, <strong>{name}</strong>.</h1>
    <p className="home-greeting-description">Class {activeClass} notes, previous papers and study material — all in one place.</p>
  </>;
}

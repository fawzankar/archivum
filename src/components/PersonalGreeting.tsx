'use client';
import React from 'react';
import { useStudentClass } from './StudentClassContext';
export default function PersonalGreeting({ activeClass }: { activeClass: number }) {
  const { displayName } = useStudentClass();
  const name = displayName.trim() || 'there';
  return <p className="hm-hello">Hello, <strong>{name}</strong> · Class {activeClass}</p>;
}

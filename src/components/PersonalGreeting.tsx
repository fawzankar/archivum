'use client';
import React, { useEffect, useState } from 'react';
import { useStudentClass } from './StudentClassContext';
import { greetingForNow } from '@/lib/studyStats';

export default function PersonalGreeting({ activeClass }: { activeClass: number }) {
  const { displayName } = useStudentClass();
  const [hello, setHello] = useState('Hey');
  useEffect(() => { setHello(greetingForNow().startsWith('Good') ? greetingForNow() : 'Hey'); }, []);
  const name = displayName.trim().split(/\s+/)[0] || 'there';
  return <div className="hx-hello"><h1><span className="hx-hello-light">{hello},</span> <strong>{name}</strong> <span className="hx-wave" aria-hidden="true" role="img">👋</span></h1><span className="sr-only">Class {activeClass}</span></div>;
}

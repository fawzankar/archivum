'use client';
import React, { useEffect, useState } from 'react';
import { useStudentClass } from './StudentClassContext';
function getGreeting(hour: number) { if (hour < 12) return 'Good morning'; if (hour < 17) return 'Good afternoon'; return 'Good evening'; }
export default function PersonalGreeting({ activeClass }: { activeClass: number }) {
  const { displayName } = useStudentClass();
  const [greeting, setGreeting] = useState('Good morning');
  const [profileReady, setProfileReady] = useState(false);
  useEffect(() => { setGreeting(getGreeting(new Date().getHours())); setProfileReady(true); }, []);
  const name = (profileReady ? displayName : '').trim() || 'there';
  return <div className="hx-hello"><h1><span className="hx-hello-light">{greeting}</span><span className="hx-name-line"><strong>{name}</strong><span className="hx-wave" aria-hidden="true" role="img">👋</span></span></h1><span className="sr-only">Class {activeClass}</span></div>;
}

'use client';
import React from 'react';
import {useStudentClass} from './StudentClassContext';
export default function PersonalGreeting(){
  const {displayName}=useStudentClass();
  return <span className="home-greeting-line">Good to see you{displayName.trim()?`, ${displayName.trim()}`:''}.</span>;
}

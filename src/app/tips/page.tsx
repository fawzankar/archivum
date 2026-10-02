import React from 'react';
import PageHead from '@/components/PageHead';
import { getTipsBundle } from '@/lib/tips';
import TipsClient from './TipsClient';

export const revalidate=300;

export default async function TipsPage(){
 const tips=await getTipsBundle();
 return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8"><PageHead title="Tips & Tricks from the SJS community." art="Maths" tone="blush">Short tips from SJS students for revision, papers and exam day. Every tip is checked before it goes up.</PageHead><TipsClient initialTips={tips} initialClass={10}/></div>;
}

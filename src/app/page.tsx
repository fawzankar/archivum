import React from 'react';
import { getRecentHomeBundle } from '@/lib/resources';
import HomeDynamicContent, { HomeHeroContent } from './HomeDynamicContent';
import HeroScene from '@/components/HeroScene';

export const revalidate = 300;

export default async function HomePage() {
  const recentByClass = await getRecentHomeBundle();

  return (
    <div className="hm">
      <div className="hm-shell">
        <header className="hx-hero">
          <HeroScene />
          <HomeHeroContent />
        </header>
        <HomeDynamicContent recentByClass={recentByClass} />
      </div>
    </div>
  );
}
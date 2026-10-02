import React from 'react';
import { getRecentHomeBundle, type RecentHomeBundle } from '@/lib/resources';
import HomeDynamicContent, { HomeHeroContent } from './HomeDynamicContent';
import HeroScene from '@/components/HeroScene';

export const revalidate = 300;

export default async function HomePage() {
  // If the database is unreachable (e.g. during a deploy build) show an empty list instead of failing the page.
  // ISR refreshes it within 5 minutes once the database is back.
  let recentByClass: RecentHomeBundle = { 9: [], 10: [], 11: [], 12: [] };
  try {
    recentByClass = await getRecentHomeBundle();
  } catch (error) {
    console.error('[home] recent resources unavailable', error);
  }

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
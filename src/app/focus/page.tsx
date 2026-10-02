import React from 'react';
import PageHead from '@/components/PageHead';
import FocusClient from './FocusClient';

export const metadata = {
  title: 'Focus timer | ARCHIVUM',
  description: 'A simple study timer with focus rounds and breaks. Everything stays on your device.',
};

export default function FocusPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <PageHead title="Focus timer" art="default" tone="peri">
        Pick a round, put your phone down, and just study. We’ll nudge you when it’s time for a break.
      </PageHead>
      <FocusClient />
    </div>
  );
}

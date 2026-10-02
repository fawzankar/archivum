import React from 'react';
import SavedClient from './SavedClient';
import PageHead from '@/components/PageHead';

export const metadata = {
  title: 'Saved | ARCHIVUM',
  description: 'Your bookmarked notes, papers and study material.',
};

export default function SavedPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <PageHead title="Saved Resources" art="default" tone="blush">
          Everything you’ve bookmarked, kept on this device just for you.
        </PageHead>

      <SavedClient />
    </div>
  );
}

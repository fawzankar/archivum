import React from 'react';
import SavedClient from './SavedClient';
import PageHead from '@/components/PageHead';

export const metadata = {
  title: 'My Saved Resources | ARCHIVUM',
  description: 'Notes and papers you’ve saved on this device.',
};

export default function SavedPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <PageHead title="Saved Resources" art="default" tone="blush">
          Notes and papers you’ve saved. They’re stored on this device only.
        </PageHead>

      <SavedClient />
    </div>
  );
}

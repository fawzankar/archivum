import React from 'react';
import SavedClient from './SavedClient';
import PageHead from '@/components/PageHead';

export const metadata = {
  title: 'My Saved Resources | ARCHIVUM',
  description: 'View your device-saved notes, board papers, and study resources.',
};

export default function SavedPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <PageHead title="Saved Resources" art="default" tone="blush">
          Your personal collection of saved notes and examination papers stored locally on this device.
        </PageHead>

      <SavedClient />
    </div>
  );
}

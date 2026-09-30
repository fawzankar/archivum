'use client';

import dynamic from 'next/dynamic';

const InstallPwaPrompt = dynamic(() => import('@/components/InstallPwaPrompt'), { ssr: false });

export default function DeferredClientWidgets() {
  return (
    <>
      <InstallPwaPrompt />
    </>
  );
}

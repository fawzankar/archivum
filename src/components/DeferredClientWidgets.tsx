'use client';

import dynamic from 'next/dynamic';

const Chatbot = dynamic(() => import('@/components/Chatbot'), { ssr: false });
const InstallPwaPrompt = dynamic(() => import('@/components/InstallPwaPrompt'), { ssr: false });

export default function DeferredClientWidgets() {
  return (
    <>
      <Chatbot />
      <InstallPwaPrompt />
    </>
  );
}

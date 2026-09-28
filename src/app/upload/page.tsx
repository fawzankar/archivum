import React from 'react';
import UploadClient from './UploadClient';
import { UsersRound, ShieldCheck, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Upload Resource — ARCHIVUM',
  description: 'Share notes, papers and study materials with other SJS students. Every submission is reviewed before publication.',
};

export default function UploadPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7 sm:py-10 space-y-6">
      <header className="community-intro">
        <div>
          <span className="community-intro-badge"><UsersRound /> Community archive</span>
          <h1 className="font-display">Put something useful back.</h1>
          <p>Upload notes, question papers, formulas or study material that another SJS student could genuinely use. Every contribution goes through moderation before it enters the archive.</p>
          <div className="flex flex-wrap gap-4 mt-4 text-[9px] font-semibold" style={{color:'var(--ink-faint)'}}><span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" style={{color:'var(--accent)'}} /> Reviewed before publishing</span><span className="inline-flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" style={{color:'var(--accent)'}} /> Built for student sharing</span></div>
        </div>
        <div className="community-identity-card"><div className="avatar"><UsersRound className="w-4 h-4" /></div><strong>Contributor identity</strong><small>Your name is attached to the submission and shown only after approval.</small></div>
      </header>
      <UploadClient />
    </div>
  );
}

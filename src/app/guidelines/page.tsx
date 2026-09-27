import React from 'react';

export const metadata = { title: 'Guidelines — ARCHIVUM' };

export default function GuidelinesPage() {
  return (
    <div className="archive-shell">
      <div className="page-heading">
        <span className="eyebrow">Community guidelines</span>
        <h1>Keep the archive useful for the next student.</h1>
        <p>A few simple rules for uploading material, writing tips and keeping shared resources easy to trust.</p>
      </div>
      <div className="archive-surface page-section px-6 sm:px-10 space-y-8">
        <section><h2 className="text-xl font-semibold">Upload material you are allowed to share</h2><p className="mt-2 text-sm" style={{color:'var(--ink-muted)'}}>Please upload notes, papers and other academic resources you have permission to share. Avoid private student information and unrelated files.</p></section>
        <section><h2 className="text-xl font-semibold">Give the file enough context</h2><p className="mt-2 text-sm" style={{color:'var(--ink-muted)'}}>Choose the correct class, subject and resource type. Add the contributor or school information when it is useful to someone trying to understand the paper.</p></section>
        <section><h2 className="text-xl font-semibold">Tips should be practical</h2><p className="mt-2 text-sm" style={{color:'var(--ink-muted)'}}>Keep community tips specific and helpful: a revision method, a way to approach a chapter, or a useful exam habit is more valuable than vague motivation.</p></section>
        <section><h2 className="text-xl font-semibold">Moderation keeps the library tidy</h2><p className="mt-2 text-sm" style={{color:'var(--ink-muted)'}}>Uploads and tips are reviewed before publication. ARCHIVUM may correct metadata or remove a resource that is duplicated, unsuitable or no longer useful.</p></section>
      </div>
    </div>
  );
}

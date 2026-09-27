import React from 'react';

export const metadata = { title: 'Privacy Policy — ARCHIVUM' };

export default function PrivacyPage() {
  return (
    <div className="archive-shell">
      <div className="page-heading">
        <span className="eyebrow">Privacy</span>
        <h1>How ARCHIVUM handles information.</h1>
        <p>Last updated: September 2026</p>
      </div>
      <div className="archive-surface page-section px-6 sm:px-10 space-y-8 text-sm leading-relaxed">
        <section><h2 className="text-xl font-semibold">Browsing the archive</h2><p className="mt-2" style={{color:'var(--ink-muted)'}}>Students can browse, read and download academic material without creating an account or providing a phone number or password.</p></section>
        <section><h2 className="text-xl font-semibold">Saved resources and preferences</h2><p className="mt-2" style={{color:'var(--ink-muted)'}}>Saved resources and interface preferences are stored in the browser on your device. They are not uploaded as a personal profile.</p></section>
        <section><h2 className="text-xl font-semibold">Ratings and downloads</h2><p className="mt-2" style={{color:'var(--ink-muted)'}}>The application records resource activity such as downloads and ratings using the mechanisms described by the application. These counters are used to provide archive statistics and prevent obvious duplicate actions.</p></section>
        <section><h2 className="text-xl font-semibold">Uploaded information</h2><p className="mt-2" style={{color:'var(--ink-muted)'}}>When you submit a resource or tip, the information you provide is used to review and publish the submission. Do not include information that should not be made public.</p></section>
      </div>
    </div>
  );
}

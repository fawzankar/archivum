import React from 'react';
import UploadClient from './UploadClient';

export const metadata = {
  title: 'Upload Resource — ARCHIVUM',
  description: 'Share notes, papers and study materials with other SJS students.',
};

export default function UploadPage() {
  return (
    <div className="archive-shell">
      <div className="page-heading">
        <span className="eyebrow">Share with SJS students</span>
        <h1>Put a useful paper or note into the archive.</h1>
        <p>If you have a clear, useful resource, upload it here. Submissions are checked before they become part of the public archive.</p>
      </div>
      <UploadClient />
    </div>
  );
}

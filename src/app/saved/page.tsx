import React from 'react';
import SavedClient from './SavedClient';

export default function SavedPage() {
  return (
    <div className="archive-shell">
      <div className="page-heading">
        <span className="eyebrow">Your saved resources</span>
        <h1>Keep the useful ones close.</h1>
        <p>Resources you save stay available here on this device, so you can return to them without searching again.</p>
      </div>
      <SavedClient />
    </div>
  );
}

import React from 'react';
import SavedClient from './SavedClient';
export const metadata={title:'Saved Resources — ARCHIVUM',description:'View your saved notes, papers and study resources.'};
export default function SavedPage(){return <div className="page-shell"><div className="page-intro"><div><h1 className="font-display">Keep the material you want to find again.</h1><p>Your bookmarks and recently viewed resources stay on this device, ready for the next revision session.</p></div><div className="page-note">Saved items are stored locally in your browser.</div></div><div className="mt-10"><SavedClient/></div></div>}

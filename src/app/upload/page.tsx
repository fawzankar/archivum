import React from 'react';
import UploadClient from './UploadClient';
export const metadata={title:'Upload Resource — ARCHIVUM',description:'Share notes, papers and study materials with other SJS students.'};
export default function UploadPage(){return <div className="page-shell"><div className="page-intro"><div><h1 className="font-display">Add something another student can use.</h1><p>Share a clear note, question paper or revision resource with the class and subject attached. Submissions are reviewed before they become part of the archive.</p></div><div className="page-note">Please include the contributor name and enough class/subject detail for someone to find the file later.</div></div><div className="mt-10"><UploadClient/></div></div>}

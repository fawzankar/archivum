'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Resource } from '@/lib/resources';
import { getSavedResourcesList, getRecentlyViewed } from '@/lib/savedStorage';
import ResourceCard from '@/components/ResourceCard';
import PdfViewerModal from '@/components/PdfViewerModal';
import { Bookmark, Clock } from 'lucide-react';

export default function SavedClient() {
  const [savedItems,setSavedItems]=useState<Resource[]>([]);
  const [recentItems,setRecentItems]=useState<Resource[]>([]);
  const [activePdf,setActivePdf]=useState<Resource|null>(null);

  useEffect(()=>{
    const update=()=>{setSavedItems(getSavedResourcesList());setRecentItems(getRecentlyViewed())};
    update();
    window.addEventListener('sjs_saved_updated',update);
    return()=>window.removeEventListener('sjs_saved_updated',update);
  },[]);

  return (
    <div className="space-y-12">
      <section>
        <div className="section-heading"><div><span className="eyebrow">Saved</span><h2>Resources you marked for later</h2></div><span className="text-sm" style={{color:'var(--ink-faint)'}}>{savedItems.length} saved</span></div>
        {savedItems.length ? <div className="resource-grid">{savedItems.map(r=><ResourceCard key={r.id} resource={r} onView={setActivePdf} />)}</div> : (
          <div className="archive-surface p-9">
            <Bookmark className="w-7 h-7" style={{color:'var(--accent)'}} />
            <h3 className="mt-4 text-lg font-semibold">Nothing saved yet.</h3>
            <p className="mt-2 text-sm max-w-lg" style={{color:'var(--ink-muted)'}}>Use the bookmark button on a note or paper when you know you will want it again.</p>
            <Link href="/notes" className="btn btn-primary mt-5">Browse notes</Link>
          </div>
        )}
      </section>

      {recentItems.length > 0 && (
        <section className="pt-8 border-t" style={{borderColor:'var(--border)'}}>
          <div className="section-heading"><div><span className="eyebrow">Recent</span><h2>Recently viewed</h2></div><Clock className="w-5 h-5" style={{color:'var(--ink-faint)'}} /></div>
          <div className="resource-grid">{recentItems.map(r=><ResourceCard key={r.id} resource={r} onView={setActivePdf} compact />)}</div>
        </section>
      )}
      <PdfViewerModal resource={activePdf} onClose={()=>setActivePdf(null)} />
    </div>
  );
}

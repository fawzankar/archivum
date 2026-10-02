'use client';
import React from 'react';

export default function ArchiveIllustration({ compact=false }: { compact?: boolean }) {
  return <div className={`archive-illustration ${compact ? 'archive-illustration-compact' : ''}`} aria-hidden="true">
    <div className="illus-dot illus-dot-a"/><div className="illus-dot illus-dot-b"/><div className="illus-dot illus-dot-c"/>
    <div className="illus-paper illus-paper-back"><span/><span/><span/></div>
    <div className="illus-folder"><div className="illus-tab">ARCHIVE</div><div className="illus-folder-lines"><i/><i/><i/><i/></div><div className="illus-stamp">SJS<br/>24</div></div>
    <div className="illus-card"><div className="illus-card-title">STUDY<br/>SHEET</div><div className="illus-chart"><i/><i/><i/><i/><i/></div><div className="illus-chart-base"/></div>
    <div className="illus-ruler"><b>0</b><b>2</b><b>4</b><b>6</b><b>8</b><b>10</b></div>
    <div className="illus-pencil"><span/></div>
    <div className="illus-note"><span>READ</span><strong>→</strong></div>
    <div className="illus-tape illus-tape-a"/><div className="illus-tape illus-tape-b"/>
  </div>;
}

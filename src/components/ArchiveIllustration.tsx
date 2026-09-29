'use client';

import React from 'react';

export default function ArchiveIllustration() {
  return (
    <div className="archive-illustration" aria-hidden="true">
      <div className="illustration-label label-blue">CLASS 10</div>
      <div className="illustration-label label-coral">STUDY KIT</div>
      <div className="illustration-label label-green">ARCHIVE 01</div>

      <div className="paper-shadow paper-shadow-one" />
      <div className="paper-shadow paper-shadow-two" />

      <div className="illustration-paper back-paper">
        <div className="paper-corner" />
        <div className="paper-line short" />
        <div className="paper-line" />
        <div className="paper-line" />
        <div className="paper-line medium" />
        <div className="paper-box-row"><span /><span /><span /></div>
      </div>

      <div className="illustration-paper main-paper">
        <div className="paper-topline"><span>ARCHIVUM</span><b>NOTES</b></div>
        <div className="paper-title">Your study<br />shelf.</div>
        <div className="paper-graph">
          <span className="bar one" /><span className="bar two" /><span className="bar three" /><span className="bar four" />
        </div>
        <div className="paper-caption">chapters · formulas · PYQs</div>
      </div>

      <div className="illustration-folder">
        <div className="folder-tab">PDF</div>
        <div className="folder-grid"><i /><i /><i /><i /><i /><i /></div>
        <div className="folder-title">RESOURCE<br />INDEX</div>
      </div>

      <div className="illustration-ruler"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span></div>
      <div className="illustration-disc" />
      <div className="illustration-ring"><span /></div>
      <div className="illustration-pencil"><span /></div>
      <div className="illustration-spark spark-a">+</div>
      <div className="illustration-spark spark-b">×</div>
      <div className="illustration-dots"><i /><i /><i /><i /></div>
    </div>
  );
}

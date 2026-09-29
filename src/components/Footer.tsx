'use client';

import { Instagram, Mail, ExternalLink } from 'lucide-react';

export default function Footer() {
  return <footer className="site-footer site-footer-premium">
    <div className="archive-shell footer-premium-grid">
      <div className="footer-brand"><div className="footer-brand-name">ARCHIVUM</div><p>A student-built academic archive for keeping useful notes, papers and study material together.</p></div>
      <div className="footer-credit"><span>Built with care by</span><strong>Fawzan Kar</strong><small>for fellow Josephites</small></div>
      <div className="footer-links"><a href="https://instagram.com/quest_sjs" target="_blank" rel="noopener noreferrer"><Instagram /> Quest Instagram</a><a href="mailto:sjsquest26@gmail.com"><Mail /> Quest email</a><a href="https://sjsquest.vercel.app" target="_blank" rel="noopener noreferrer"><ExternalLink /> SJS Quest</a></div>
    </div>
    <div className="footer-bottom">ARCHIVUM × QUEST · Made for students, shared by students.</div>
  </footer>;
}

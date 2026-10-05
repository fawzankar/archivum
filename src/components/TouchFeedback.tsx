'use client';
import { useEffect } from 'react';
import { playSound } from '@/lib/sound';

const TARGET = 'a[href],button,[role="button"],summary,label[for],.resource-card,.hm-jump-card,.subject-tile,.notes-subject-card,.accent-swatch';

/** One listener for the whole app: a soft sound wherever something is actually tapped. */
export default function TouchFeedback() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.(TARGET) as HTMLElement | null;
      if (!el || (el as HTMLButtonElement).disabled || el.getAttribute('aria-disabled') === 'true') return;
      if (el.closest('.pdf-reader-stage, .pdf-pages')) return; // reading area stays silent

      const tab = el.closest('.mobile-nav-link');
      if (tab) {
        const links = Array.from(document.querySelectorAll('.mobile-nav-link'));
        playSound('nav', links.indexOf(tab));
      } else if (el.matches('.resource-card,.resource-card *,.hm-jump-card,.subject-tile,.notes-subject-card')) {
        playSound('soft');
      } else {
        playSound('tap');
      }

    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);
  return null;
}

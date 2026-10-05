'use client';
import { useEffect } from 'react';
import { playSound } from '@/lib/sound';
import { haptic } from '@/lib/haptics';

const TARGET = 'a[href],button,[role="button"],summary,label[for],.resource-card,.hm-jump-card,.subject-tile,.notes-subject-card,.accent-swatch';

/** One listener for the whole app: a soft sound and a small ripple wherever something is actually tapped. */
export default function TouchFeedback() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.(TARGET) as HTMLElement | null;
      if (el?.closest('.ax-haptic-probe')) return;
      if (!el || (el as HTMLButtonElement).disabled || el.getAttribute('aria-disabled') === 'true') return;
      if (el.closest('.pdf-reader-stage, .pdf-pages')) return; // reading area stays silent

      const tab = el.closest('.mobile-nav-link');
      if (tab) {
        const links = Array.from(document.querySelectorAll('.mobile-nav-link'));
        playSound('nav', links.indexOf(tab));
        haptic('nav');
      } else if (el.matches('.resource-card,.resource-card *,.hm-jump-card,.subject-tile,.notes-subject-card')) {
        playSound('soft');
        haptic('soft');
      } else {
        playSound('tap');
        haptic(el.matches('.accent-swatch,[role="switch"]') ? 'toggle' : 'tap');
      }

      if (reduce.matches || (e.clientX === 0 && e.clientY === 0)) return; // keyboard "click"
      const r = document.createElement('span');
      r.className = 'ax-ripple';
      r.style.left = e.clientX + 'px';
      r.style.top = e.clientY + 'px';
      document.body.appendChild(r);
      window.setTimeout(() => r.remove(), 600);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);
  return null;
}

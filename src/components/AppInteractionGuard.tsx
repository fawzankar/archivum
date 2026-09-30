'use client';

import { useEffect } from 'react';

function insidePdf(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest('.pdf-reader-shell'));
}

export default function AppInteractionGuard() {
  useEffect(() => {
    const contextMenu = (event: MouseEvent) => {
      if (!insidePdf(event.target)) event.preventDefault();
    };
    const wheel = (event: WheelEvent) => {
      if (!insidePdf(event.target) && (event.ctrlKey || event.metaKey)) event.preventDefault();
    };
    const keydown = (event: KeyboardEvent) => {
      if (insidePdf(event.target)) return;
      const zoomKey = ['+', '=', '-', '_', '0'].includes(event.key);
      if ((event.ctrlKey || event.metaKey) && zoomKey) event.preventDefault();
    };
    const gesture = (event: Event) => {
      if (!insidePdf(event.target)) event.preventDefault();
    };
    const touchStart = (event: TouchEvent) => {
      if (!insidePdf(event.target) && event.touches.length > 1) event.preventDefault();
    };

    document.addEventListener('contextmenu', contextMenu);
    document.addEventListener('wheel', wheel, { passive: false });
    document.addEventListener('keydown', keydown);
    document.addEventListener('gesturestart', gesture, { passive: false } as AddEventListenerOptions);
    document.addEventListener('gesturechange', gesture, { passive: false } as AddEventListenerOptions);
    document.addEventListener('gestureend', gesture, { passive: false } as AddEventListenerOptions);
    document.addEventListener('touchstart', touchStart, { passive: false });

    return () => {
      document.removeEventListener('contextmenu', contextMenu);
      document.removeEventListener('wheel', wheel);
      document.removeEventListener('keydown', keydown);
      document.removeEventListener('gesturestart', gesture);
      document.removeEventListener('gesturechange', gesture);
      document.removeEventListener('gestureend', gesture);
      document.removeEventListener('touchstart', touchStart);
    };
  }, []);

  return null;
}

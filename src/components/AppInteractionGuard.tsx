'use client';

import { useEffect } from 'react';

const isInsideReader = (target: EventTarget | null) =>
  target instanceof Element && Boolean(target.closest('.pdf-reader-shell'));

export default function AppInteractionGuard() {
  useEffect(() => {
    const blockNativeBrowserZoom = (event: Event) => {
      if (event.cancelable) event.preventDefault();
    };
    const blockTouchPinchOutsideReader = (event: TouchEvent) => {
      if (event.touches.length > 1 && !isInsideReader(event.target)) blockNativeBrowserZoom(event);
    };
    const blockBrowserZoomKeys = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && ['+', '=', '-', '0'].includes(event.key)) event.preventDefault();
    };
    const blockBrowserZoomWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) blockNativeBrowserZoom(event);
    };

    document.addEventListener('touchmove', blockTouchPinchOutsideReader, { passive: false, capture: true });
    document.addEventListener('gesturestart', blockNativeBrowserZoom as EventListener, { passive: false });
    document.addEventListener('gesturechange', blockNativeBrowserZoom as EventListener, { passive: false });
    document.addEventListener('gestureend', blockNativeBrowserZoom as EventListener, { passive: false });
    document.addEventListener('wheel', blockBrowserZoomWheel, { passive: false });
    document.addEventListener('keydown', blockBrowserZoomKeys);

    return () => {
      document.removeEventListener('touchmove', blockTouchPinchOutsideReader, true);
      document.removeEventListener('gesturestart', blockNativeBrowserZoom as EventListener);
      document.removeEventListener('gesturechange', blockNativeBrowserZoom as EventListener);
      document.removeEventListener('gestureend', blockNativeBrowserZoom as EventListener);
      document.removeEventListener('wheel', blockBrowserZoomWheel);
      document.removeEventListener('keydown', blockBrowserZoomKeys);
    };
  }, []);

  return null;
}

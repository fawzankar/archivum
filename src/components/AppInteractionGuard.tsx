'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const isInsideReader = (target: EventTarget | null) =>
  target instanceof Element && Boolean(target.closest('.pdf-reader-shell'));

export default function AppInteractionGuard() {
  const pathname = usePathname();

  // Leaving a note (or restoring a page from the back/forward cache) must never leave the page in a "reader open" state.
  useEffect(() => {
    const reset = () => {
      if (!document.querySelector('.pdf-reader-shell')) document.body.style.removeProperty('overflow');
      if (!document.querySelector('.search-modal, .menu-layer.open')) {
        document.documentElement.classList.remove('overlay-scroll-locked');
        document.body.classList.remove('overlay-scroll-locked');
      }
      if (document.fullscreenElement && !document.querySelector('.pdf-reader-shell')) document.exitFullscreen?.().catch(() => {});
    };
    reset();
    window.addEventListener('pageshow', reset);
    return () => window.removeEventListener('pageshow', reset);
  }, [pathname]);

  useEffect(() => {
    const blockNativeBrowserZoom = (event: Event) => {
      if (event.cancelable) event.preventDefault();
    };
    const blockTouchPinchOutsideReader = (event: TouchEvent) => {
      if (event.touches.length > 1 && !isInsideReader(event.target)) blockNativeBrowserZoom(event);
    };
    const blockGestureOutsideReader = (event: Event) => {
      if (!isInsideReader(event.target)) blockNativeBrowserZoom(event);
    };
    const blockBrowserZoomKeys = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && ['+', '=', '-', '0'].includes(event.key)) event.preventDefault();
    };
    const blockBrowserZoomWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) blockNativeBrowserZoom(event);
    };

    const isEditable = (t: EventTarget | null) =>
      t instanceof Element && Boolean(t.closest('input, textarea, [contenteditable="true"]'));
    const blockContextMenu = (event: Event) => {
      if (!isEditable(event.target) && event.cancelable) event.preventDefault();
    };
    const blockDrag = (event: Event) => {
      if (event.target instanceof Element && event.target.closest('img, a') && event.cancelable) event.preventDefault();
    };
    document.addEventListener('contextmenu', blockContextMenu);
    document.addEventListener('dragstart', blockDrag);

    document.addEventListener('touchmove', blockTouchPinchOutsideReader, { passive: false, capture: true });
    document.addEventListener('gesturestart', blockGestureOutsideReader, { passive: false });
    document.addEventListener('gesturechange', blockGestureOutsideReader, { passive: false });
    document.addEventListener('gestureend', blockGestureOutsideReader, { passive: false });
    document.addEventListener('wheel', blockBrowserZoomWheel, { passive: false });
    document.addEventListener('keydown', blockBrowserZoomKeys);

    return () => {
      document.removeEventListener('contextmenu', blockContextMenu);
      document.removeEventListener('dragstart', blockDrag);
      document.removeEventListener('touchmove', blockTouchPinchOutsideReader, true);
      document.removeEventListener('gesturestart', blockGestureOutsideReader);
      document.removeEventListener('gesturechange', blockGestureOutsideReader);
      document.removeEventListener('gestureend', blockGestureOutsideReader);
      document.removeEventListener('wheel', blockBrowserZoomWheel);
      document.removeEventListener('keydown', blockBrowserZoomKeys);
    };
  }, []);

  return null;
}

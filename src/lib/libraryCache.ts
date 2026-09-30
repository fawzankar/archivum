'use client';

import { useEffect, useState } from 'react';
import type { LibraryBundle, Resource } from './resources';

const KEY = 'archivum_library_v3';
const CHECKED_KEY = 'archivum_library_checked_v3';
const REFRESH_AFTER_MS = 30 * 60 * 1000; // data older than this is refreshed in the background

export const CLASSES = [9, 10, 11, 12] as const;

export function emptyBundle(): LibraryBundle {
  return { notes: { 9: [], 10: [], 11: [], 12: [] }, papers: { 9: [], 10: [], 11: [], 12: [] }, generatedAt: 0 };
}

export function hasItems(b: LibraryBundle | null | undefined): b is LibraryBundle {
  if (!b) return false;
  return CLASSES.some((c) => (b.notes?.[c]?.length || 0) + (b.papers?.[c]?.length || 0) > 0);
}

export function readStoredBundle(): LibraryBundle | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LibraryBundle;
    return parsed && parsed.notes && parsed.papers ? parsed : null;
  } catch {
    return null;
  }
}

export function storeBundle(bundle: LibraryBundle) {
  try { localStorage.setItem(KEY, JSON.stringify(bundle)); } catch {}
}

function markChecked() {
  try { localStorage.setItem(CHECKED_KEY, String(Date.now())); } catch {}
}

function lastChecked(): number {
  try { return Number(localStorage.getItem(CHECKED_KEY) || 0); } catch { return 0; }
}

/** Pick whichever bundle is newer, never letting an empty one win over real data. */
export function newest(a: LibraryBundle, b: LibraryBundle | null): LibraryBundle {
  if (!b) return a;
  if (!hasItems(a)) return hasItems(b) ? b : a;
  if (!hasItems(b)) return a;
  return b.generatedAt > a.generatedAt ? b : a;
}

let inflight: Promise<LibraryBundle | null> | null = null;

/** Fetch the whole library once (deduped), store it, and return it. */
export function fetchBundle(): Promise<LibraryBundle | null> {
  if (inflight) return inflight;
  inflight = fetch('/api/library')
    .then((r) => (r.ok ? (r.json() as Promise<LibraryBundle>) : null))
    .then((data) => {
      if (data && hasItems(data)) { storeBundle(data); markChecked(); return data; }
      return null;
    })
    .catch(() => null)
    .finally(() => { inflight = null; });
  return inflight;
}

/** Fill localStorage in the background (called from Home) so Notes/Papers open instantly. */
export function warmLibrary() {
  const stored = readStoredBundle();
  const age = Date.now() - Math.max(stored?.generatedAt || 0, lastChecked());
  if (stored && hasItems(stored) && age < REFRESH_AFTER_MS) return;
  void fetchBundle();
}

/**
 * The library for the current page. Starts from the statically generated server bundle (or the
 * copy already on this device, whichever is newer), so first paint needs NO network request.
 * Only when the data is older than 30 minutes is it refreshed quietly in the background.
 */
export function useLibraryBundle(server: LibraryBundle): LibraryBundle {
  const [bundle, setBundle] = useState<LibraryBundle>(() => newest(server, readStoredBundle()));

  useEffect(() => {
    if (hasItems(bundle)) {
      const stored = readStoredBundle();
      if (!stored || stored.generatedAt < bundle.generatedAt) storeBundle(bundle);
    }
    const age = Date.now() - Math.max(bundle.generatedAt, lastChecked());
    if (hasItems(bundle) && age < REFRESH_AFTER_MS) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
    let cancelled = false;
    void fetchBundle().then((fresh) => {
      if (!cancelled && fresh) setBundle((current) => newest(current, fresh));
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return bundle;
}

export function allPapersSorted(bundle: LibraryBundle): Resource[] {
  const merged: Resource[] = [];
  for (const c of CLASSES) merged.push(...(bundle.papers[c] || []));
  return merged.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

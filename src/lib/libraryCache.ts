'use client';

import type { Resource } from './resources';

const KEY = 'archivum_library_prefetch_v2';
const LEGACY_KEY = 'archivum_library_prefetch_v1';

export interface LibraryCache {
  notes: Record<string, Resource[]>;
  papers: Record<string, Resource[]>;
  version: 2;
}

const empty = (): LibraryCache => ({ notes: {}, papers: {}, version: 2 });

export function readLibraryCache(): LibraryCache {
  if (typeof window === 'undefined') return empty();
  try {
    const raw = sessionStorage.getItem(KEY) || sessionStorage.getItem(LEGACY_KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw);
    return { notes: parsed?.notes || {}, papers: parsed?.papers || {}, version: 2 };
  } catch {
    return empty();
  }
}

export function writeLibraryCache(data: Partial<LibraryCache>) {
  try {
    const current = readLibraryCache();
    const next: LibraryCache = {
      notes: { ...current.notes, ...(data.notes || {}) },
      papers: { ...current.papers, ...(data.papers || {}) },
      version: 2,
    };
    sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
}

const inflight = new Map<number, Promise<LibraryCache | null>>();

/** Fetch one class's notes + papers (deduped, browser/CDN cached) and store it in sessionStorage. */
export function fetchClassBundle(classLevel: number): Promise<LibraryCache | null> {
  const existing = inflight.get(classLevel);
  if (existing) return existing;
  const request = fetch(`/api/library-prefetch?class=${classLevel}`, { cache: 'force-cache' })
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (data) writeLibraryCache(data);
      return data as LibraryCache | null;
    })
    .catch(() => null)
    .finally(() => { inflight.delete(classLevel); });
  inflight.set(classLevel, request);
  return request;
}

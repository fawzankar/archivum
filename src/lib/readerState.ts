'use client';

/**
 * Per-resource reader memory (last page + zoom) and the night-mode preference.
 * Stored in localStorage; every call is wrapped so private mode / full storage never breaks the reader.
 */

const PROGRESS_KEY = 'archivum_reader_progress_v1';
const NIGHT_KEY = 'archivum_reader_night_v1';
const MAX_ENTRIES = 150;

export interface ReaderProgress { page: number; zoom: number; pages: number; at: number }

type ProgressMap = Record<string, ReaderProgress>;

function readMap(): ProgressMap {
  if (typeof window === 'undefined') return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch { return {}; }
}

export function getReaderProgress(resourceId: number): ReaderProgress | null {
  const entry = readMap()[String(resourceId)];
  if (!entry || !Number.isFinite(entry.page) || entry.page < 1) return null;
  return entry;
}

export function saveReaderProgress(resourceId: number, progress: Omit<ReaderProgress, 'at'>) {
  if (typeof window === 'undefined') return;
  try {
    const map = readMap();
    map[String(resourceId)] = { ...progress, at: Date.now() };
    const keys = Object.keys(map);
    if (keys.length > MAX_ENTRIES) {
      keys.sort((a, b) => (map[a].at || 0) - (map[b].at || 0)).slice(0, keys.length - MAX_ENTRIES).forEach((key) => delete map[key]);
    }
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
    window.dispatchEvent(new Event('sjs_reader_progress_updated'));
  } catch { /* storage unavailable */ }
}

export function getNightMode(): boolean {
  if (typeof window === 'undefined') return false;
  try { return localStorage.getItem(NIGHT_KEY) === '1'; } catch { return false; }
}

export function setNightMode(on: boolean) {
  try { localStorage.setItem(NIGHT_KEY, on ? '1' : '0'); } catch { /* ignore */ }
}

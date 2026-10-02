'use client';

import { Resource } from './resources';

const SAVED_KEY = 'sjs_saved_resources';
const RECENT_KEY = 'sjs_recently_viewed';

export function getSavedResourceIds(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((id): id is number => Number.isInteger(id) && id > 0)
      : [];
  } catch {
    return [];
  }
}

export function isResourceSaved(id: number): boolean {
  const ids = getSavedResourceIds();
  return ids.includes(id);
}

export function toggleSaveResource(resource: Resource): boolean {
  const ids = getSavedResourceIds();
  const exists = ids.includes(resource.id);
  let updated: number[];
  if (exists) {
    updated = ids.filter((item) => item !== resource.id);
  } else {
    updated = [resource.id, ...ids];
  }
  localStorage.setItem(SAVED_KEY, JSON.stringify(updated));

  try {
    const metaRaw = localStorage.getItem('sjs_saved_meta') || '{}';
    const meta = JSON.parse(metaRaw);
    if (!exists) {
      meta[resource.id] = resource;
    } else {
      delete meta[resource.id];
    }
    localStorage.setItem('sjs_saved_meta', JSON.stringify(meta));
  } catch {}

  window.dispatchEvent(new Event('sjs_saved_updated'));
  return !exists;
}

export function getSavedResourcesList(): Resource[] {
  if (typeof window === 'undefined') return [];
  try {
    const metaRaw = localStorage.getItem('sjs_saved_meta') || '{}';
    const meta = JSON.parse(metaRaw);
    const ids = getSavedResourceIds();
    return ids.map((id) => meta[id]).filter(Boolean);
  } catch {
    return [];
  }
}

export function addRecentlyViewed(resource: Resource) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(RECENT_KEY) || '[]';
    let list: Resource[] = JSON.parse(raw);
    list = [resource, ...list.filter((r) => r.id !== resource.id)].slice(0, 10);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('sjs_recently_viewed_updated'));
  } catch {}
}

export function getRecentlyViewed(): Resource[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY) || '[]';
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

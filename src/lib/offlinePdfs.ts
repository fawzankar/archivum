'use client';

/**
 * Offline notes. A PDF is downloaded once and stored in Cache Storage under a synthetic key that includes the
 * file hash, so an edited upload never serves a stale copy. The reader loads these bytes directly, which means
 * no service-worker range-request handling is needed.
 */

const CACHE_NAME = 'archivum-offline-pdfs-v1';
const META_KEY = 'archivum_offline_pdfs_v1';

export interface OfflineEntry { id: number; title: string; size: number; at: number; fileKey: string }

export const offlineSupported = () => typeof window !== 'undefined' && 'caches' in window;

const cacheUrl = (fileKey: string) => `${window.location.origin}/offline-pdf/${encodeURIComponent(fileKey)}`;

function readMeta(): Record<string, OfflineEntry> {
  try {
    const parsed = JSON.parse(localStorage.getItem(META_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch { return {}; }
}
function writeMeta(meta: Record<string, OfflineEntry>) {
  try { localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch { /* ignore */ }
  window.dispatchEvent(new Event('sjs_offline_updated'));
}

export function listOfflinePdfs(): OfflineEntry[] {
  if (typeof window === 'undefined') return [];
  return Object.values(readMeta()).sort((a, b) => b.at - a.at);
}

export async function hasOfflinePdf(fileKey: string): Promise<boolean> {
  if (!offlineSupported()) return false;
  try { return Boolean(await (await caches.open(CACHE_NAME)).match(cacheUrl(fileKey))); } catch { return false; }
}

export async function getOfflinePdf(fileKey: string): Promise<ArrayBuffer | null> {
  if (!offlineSupported()) return null;
  try {
    const hit = await (await caches.open(CACHE_NAME)).match(cacheUrl(fileKey));
    return hit ? await hit.arrayBuffer() : null;
  } catch { return null; }
}

export async function saveOfflinePdf(
  entry: { id: number; title: string; fileKey: string; url: string; pageUrl?: string },
  onProgress?: (percent: number) => void,
): Promise<void> {
  if (!offlineSupported()) throw new Error('Offline storage is not supported in this browser.');
  const response = await fetch(entry.url, { credentials: 'same-origin' });
  if (!response.ok) throw new Error('Could not download this note.');
  const total = Number(response.headers.get('Content-Length')) || 0;

  let blob: Blob;
  if (response.body && total > 0) {
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let loaded = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.byteLength;
      onProgress?.(Math.min(99, Math.round((loaded / total) * 100)));
    }
    blob = new Blob(chunks as BlobPart[], { type: 'application/pdf' });
  } else {
    blob = await response.blob();
  }

  const cache = await caches.open(CACHE_NAME);
  // Drop older copies of the same resource (different file hash) first.
  const meta = readMeta();
  const previous = meta[String(entry.id)];
  if (previous && previous.fileKey !== entry.fileKey) await cache.delete(cacheUrl(previous.fileKey));
  await cache.put(cacheUrl(entry.fileKey), new Response(blob, { headers: { 'Content-Type': 'application/pdf', 'Content-Length': String(blob.size) } }));

  meta[String(entry.id)] = { id: entry.id, title: entry.title, size: blob.size, at: Date.now(), fileKey: entry.fileKey };
  writeMeta(meta);
  onProgress?.(100);

  // Also let the service worker keep the resource page itself so it opens without a connection.
  if (entry.pageUrl) navigator.serviceWorker?.controller?.postMessage({ type: 'WARM', urls: [entry.pageUrl] });
}

export async function removeOfflinePdf(id: number): Promise<void> {
  const meta = readMeta();
  const entry = meta[String(id)];
  if (entry && offlineSupported()) { try { await (await caches.open(CACHE_NAME)).delete(cacheUrl(entry.fileKey)); } catch { /* ignore */ } }
  delete meta[String(id)];
  writeMeta(meta);
}

import { execute, queryOne } from '@/lib/db';
import { MAX_FILE_SIZE, MAX_STORAGE_BYTES, getStorageUsageBytes } from '@/lib/storage';

export { MAX_FILE_SIZE, MAX_STORAGE_BYTES };

async function clearExpiredReservations() {
  await execute("DELETE FROM storage_reservations WHERE expires_at <= ?", [new Date().toISOString()]);
}

export async function reserveStorageBytes(storageKey: string, bytes: number) {
  await clearExpiredReservations();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString();
  const result = await execute(
    `INSERT OR IGNORE INTO storage_reservations (storage_key,file_size,expires_at,created_at)
     SELECT ?,?,?,?
     WHERE COALESCE((SELECT SUM(file_size) FROM resources WHERE status != 'deleted'),0)
       + COALESCE((SELECT SUM(file_size) FROM storage_reservations WHERE expires_at > ?),0)
       + ? <= ?`,
    [storageKey, bytes, expiresAt, now.toISOString(), now.toISOString(), bytes, MAX_STORAGE_BYTES],
  );
  return { allowed: Number(result.rowsAffected ?? 0) > 0, expiresAt };
}

export async function getStorageUsageWithReservations() {
  await clearExpiredReservations();
  const usedBytes = await getStorageUsageBytes();
  const row = await queryOne<{ total: number }>(
    "SELECT COALESCE(SUM(file_size),0) AS total FROM storage_reservations WHERE expires_at > ?",
    [new Date().toISOString()]
  );
  const reservedBytes = Number(row?.total ?? 0);
  return {
    usedBytes,
    reservedBytes,
    effectiveUsedBytes: usedBytes + reservedBytes,
    remainingBytes: Math.max(0, MAX_STORAGE_BYTES - usedBytes - reservedBytes),
  };
}

export async function getReservation(storageKey: string) {
  await clearExpiredReservations();
  return queryOne<{ storage_key: string; file_size: number; expires_at: string }>(
    'SELECT storage_key,file_size,expires_at FROM storage_reservations WHERE storage_key=?',
    [storageKey]
  );
}

export async function releaseStorageReservation(storageKey: string) {
  await execute('DELETE FROM storage_reservations WHERE storage_key=?', [storageKey]);
}

#!/usr/bin/env node
/**
 * One-off: move PDFs from public/uploads (committed to git) into the Cloudflare R2 bucket,
 * then point each database row at the R2 object. After it succeeds you can delete public/uploads.
 *
 *   Dry run (changes nothing):   node --env-file=.env.local scripts/migrate-uploads-to-r2.mjs
 *   Do it for real:              node --env-file=.env.local scripts/migrate-uploads-to-r2.mjs --apply
 *
 * Needs the same env vars as the app: TURSO_*, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID (or R2_TOKEN_ID),
 * R2_SECRET_ACCESS_KEY (or R2_TOKEN_VALUE), R2_BUCKET_NAME.
 * Safe to re-run: rows already pointing at R2 are skipped, and a row is only updated after the
 * uploaded object is verified to have the same size as the local file.
 */
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createClient } from '@libsql/client';

const apply = process.argv.includes('--apply');
const env = process.env;

const secret = env.R2_TOKEN_VALUE?.trim()
  ? createHash('sha256').update(env.R2_TOKEN_VALUE.trim()).digest('hex')
  : (env.R2_SECRET_ACCESS_KEY || '').trim();
const accessKeyId = env.R2_ACCESS_KEY_ID || env.R2_TOKEN_ID;
if (!env.TURSO_DATABASE_URL || !env.R2_ACCOUNT_ID || !accessKeyId || !secret || !env.R2_BUCKET_NAME) {
  console.error('Missing environment variables. Run with: node --env-file=.env.local scripts/migrate-uploads-to-r2.mjs');
  process.exit(1);
}

const db = createClient({ url: env.TURSO_DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN });
const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey: secret },
});
const bucket = env.R2_BUCKET_NAME;
const uploadsRoot = resolve(process.cwd(), 'public', 'uploads');

const contentTypeFor = (name) => /\.pdf$/i.test(name) ? 'application/pdf'
  : /\.png$/i.test(name) ? 'image/png' : /\.jpe?g$/i.test(name) ? 'image/jpeg' : 'application/octet-stream';

const { rows } = await db.execute("SELECT id, title, file_url, file_name FROM resources WHERE file_url LIKE '/uploads/%' AND status != 'deleted'");
console.log(`${apply ? 'APPLY' : 'DRY RUN'}: ${rows.length} resource(s) still use public/uploads.\n`);

let moved = 0, skipped = 0, failed = 0;
for (const row of rows) {
  const fileUrl = String(row.file_url);
  const relative = decodeURIComponent(fileUrl.slice('/uploads/'.length));
  const localPath = resolve(uploadsRoot, relative);
  const label = `#${row.id} ${row.title}`;
  try {
    if (!localPath.startsWith(uploadsRoot + sep)) throw new Error('path escapes public/uploads');
    const info = await stat(localPath).catch(() => null);
    if (!info) { console.log(`skip   ${label}: local file not found (${relative})`); skipped += 1; continue; }

    const key = `uploads/${relative}`;
    console.log(`${apply ? 'upload' : 'would upload'} ${label}  ${(info.size / 1048576).toFixed(1)} MB -> r2://${key}`);
    if (!apply) { moved += 1; continue; }

    await r2.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: await readFile(localPath), ContentType: contentTypeFor(relative) }));
    const head = await r2.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    if (Number(head.ContentLength) !== info.size) throw new Error(`size mismatch after upload (${head.ContentLength} vs ${info.size})`);

    await db.execute({ sql: 'UPDATE resources SET file_url = ?, storage_key = ?, updated_at = ? WHERE id = ?', args: [`r2://${key}`, key, new Date().toISOString(), row.id] });
    moved += 1;
  } catch (error) {
    failed += 1;
    console.error(`FAILED ${label}:`, error instanceof Error ? error.message : error);
  }
}

console.log(`\n${apply ? 'Moved' : 'Would move'} ${moved}, skipped ${skipped}, failed ${failed}.`);
if (apply && !failed) console.log('Next: open a few notes on the site to confirm, then `git rm -r --cached public/uploads` and commit.');
if (!apply) console.log('Re-run with --apply to perform the migration.');
process.exit(failed ? 1 : 0);

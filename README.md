# SJS CONNECT

SJS CONNECT is a JKBOSE-focused study-resource library for Classes 9–12.

## Vercel deployment

This version is designed for Vercel instead of relying on a writable local SQLite file or `public/uploads` for new uploads.

### 1. Create a Turso database

Create a Turso/libSQL database and obtain:

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`

The app creates its tables and seeds the starter library automatically on first connection.

### 2. Enable Vercel Blob

Create/connect a Vercel Blob store and add:

- `BLOB_READ_WRITE_TOKEN`

New user uploads are stored in Blob and their public URLs are saved in Turso.

### 3. Add environment variables in Vercel

Add all variables from `.env.example` to the Vercel project's Production (and Preview if desired) environment.

Use a long random value for `JWT_SECRET` and change the bootstrap admin password before production use.

### 4. Deploy

```bash
npm install
npm run build
```

Then deploy normally with Vercel.

## Local development

Local development now uses the same cloud database/storage interfaces as production. Set the Turso and Blob variables in `.env.local` so the app behaves the same way locally and on Vercel.

## Included starter files

The original sample PDFs remain under `public/uploads/`, so the seeded library works immediately after the database is initialized. New uploads go to Vercel Blob when `BLOB_READ_WRITE_TOKEN` is configured.

## Main production fixes

- Removed `better-sqlite3` from the application runtime.
- Replaced filesystem-backed SQLite with Turso/libSQL.
- Replaced persistent user uploads on the Vercel filesystem with Vercel Blob.
- Converted database access to async serverless-safe operations.
- Added explicit Vercel runtime behavior for upload/resource APIs.
- Preserved approved-resource filtering on public APIs.
- Hardened upload validation and orphan-file cleanup.
- Hardened admin authentication and production JWT configuration.
- Kept the existing UI, seeded resources, search, ratings, downloads, moderation, and saved-resource flows.


### Vercel build compatibility

The Turso client is pinned to `@libsql/client` 0.18.0 and the database helpers use the exported `InArgs` type. This avoids the `InStatement['args']` TypeScript failure caused by newer libSQL type definitions. Resource query helpers are intentionally generic without an unnecessary `Record<string, unknown>` constraint so typed resource models compile correctly.


## Upload limits and compression

- Maximum upload size: **50 MB**.
- Large files do **not** pass through a Vercel Function. The browser uploads directly to Vercel Blob using a secure client-upload token and multipart upload support.
- Before upload, SJS CONNECT runs an in-browser optimization pass:
  - PDFs are losslessly re-saved with PDF object streams when that produces a smaller file.
  - JPEG images are resized to a maximum dimension of 2400px and re-encoded at quality 82 when that reduces size.
  - PNG images are resized when needed and kept lossless.
- The app never replaces a file with a larger "compressed" result.
- The server verifies the Blob object size/type before saving the database record.
- Duplicate checks use a SHA-256 hash of the optimized file.
- If database finalization fails or a duplicate is detected, the newly uploaded Blob is removed to avoid orphaned files.

Vercel Functions have a 4.5 MB request-body limit, so the upload page uses Vercel Blob client uploads for files above that size instead of sending the document through `/api/upload`. Vercel Blob supports multipart uploads and large files. See the official Vercel client-upload documentation for the architecture. 


## Vercel production notes

Connect your Vercel Blob store to this project so `BLOB_READ_WRITE_TOKEN` is available to the deployment. The upload flow uses `@vercel/blob/client` direct uploads, allowing files up to 50 MB without sending the file through a Vercel Function.

Required production environment variables:
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `BLOB_READ_WRITE_TOKEN`
- `JWT_SECRET`

The Turso schema and starter data initialization is idempotent and safe when multiple Vercel instances initialize concurrently. Starter rows use `INSERT OR IGNORE`, and rating inserts are also race-safe.


## UI refresh

- Light and dark modes with five accent palettes: Default Blue, Violet, Light Blue, Ocean, and Rose.
- Responsive header, mobile navigation, adaptive contrast, and a desktop accent palette.
- Uploads require a contributor name so approved uploads can power the contributor leaderboard.
- Public reviews are user-submitted and moderation-gated; no fabricated testimonials are seeded.
- Footer and About page credit Fawzan Kar as the current solo founder/developer.


## Cloudflare R2 PDF storage

ARCHIVUM stores uploaded PDFs/images in a private Cloudflare R2 bucket and stores their metadata plus storage key in Turso. Uploads and downloads use short-lived signed URLs, so the bucket does not need to be public.

### Cloudflare setup

1. Create a Cloudflare account and open **R2 Object Storage**.
2. Create a bucket, for example `archivum`.
3. Create an R2 API token with **Object Read & Write** access to that bucket.
4. Keep the bucket private. No public URL is required because ARCHIVUM uses signed upload/download URLs.
5. In Vercel, add:
   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME`
   - `R2_PUBLIC_URL` (optional; leave blank for a private bucket)
6. Redeploy.

Uploaded objects are placed under `uploads/`. Uploads use short-lived signed PUT URLs, and downloads use short-lived signed GET URLs. R2 credentials never reach the browser. The upload form also performs real client-side compression before the signed upload: PDFs have their embedded images recompressed, while JPG/PNG images are optimized. The original file is kept automatically when compression would make it larger.

### Local development

Without R2 variables, the app can still use `public/uploads` for local-only development. Vercel deployments should use R2.


### R2 CORS

Because the admin upload page sends the PDF directly from the browser to the signed R2 URL, add a bucket CORS rule allowing your ARCHIVUM origin. For local development and production, use both origins:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://sjswork.vercel.app"
    ],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

If you later attach a custom domain to ARCHIVUM, add that origin too.

## ARCHIVUM storage limits

ARCHIVUM enforces a hard **10 GB total file-storage limit** across uploaded resources. Individual uploads are limited to **50 MB**. The admin dashboard shows current storage usage and remaining capacity. Deleted resources have their stored object removed so the space becomes available again.

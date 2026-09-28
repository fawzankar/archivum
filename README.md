# ARCHIVUM

ARCHIVUM is a student study library for Classes 9–12 with notes, previous papers, tips, search, saved resources and community uploads.

## Run locally

Create `.env.local` from `.env.example`, install dependencies, then run:

```bash
npm install
npm run dev
```

## Production

```bash
npm run build
npm run start
```

The production deployment uses Turso for data and Cloudflare R2 for uploaded documents and photos.

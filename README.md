# ARCHIVUM

Academic archive web app for SJS students.

Built by Fawzan Kar.

## Stack

Next.js, React, TypeScript, Tailwind CSS, Turso and Cloudflare R2.

## Development

```bash
npm install
npm run dev
```

Required environment variables are listed in `.env.example`.

## Where things live

- Author credit (wording and link): `src/lib/credit.ts`. The splash, hamburger menu and About page all read from it.
- Splash screen: `src/components/SplashScreen.tsx` (timing) and `src/app/brand.css` (look).

# ARCHIVUM

Academic archive web app for SJS students.

## Stack

Next.js, React, TypeScript, Tailwind CSS, Turso and Cloudflare R2.

## Development

```bash
npm install
npm run dev
```

Required environment variables are listed in `.env.example`.


## Splash screen and PWA

- `src/lib/bootSplash.ts` holds the splash styles, logo and boot script. `layout.tsx` inlines them in `<head>`, so the splash is the first paint on every full page load. `SplashScreen.tsx` only controls how long it stays and its fade-out.
- To change splash colours per theme, edit the `THEMES` table in `bootSplash.ts`.
- `public/manifest.json`, `public/icons/`, `public/offline.html` and `public/sw.js` make up the PWA. Bump `VERSION` in `sw.js` whenever you change cached assets.
- `InstallPwaPrompt.tsx` shows the install card after the splash and onboarding. Closing it asks "Never show this again?"; "Never" is stored in `localStorage` under `archivum_pwa_install`, "Remind me later" snoozes for 3 days.
- The service worker and install prompt only run in production builds (`npm run build && npm start`) over HTTPS or localhost.

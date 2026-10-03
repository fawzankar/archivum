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
- `public/manifest.json`, `public/icons/`, `public/offline.html` and `public/sw.js` make up the PWA. With no internet the service worker shows `offline.html` ("You're offline"); the app itself never serves stale pages. Bump `VERSION` in `sw.js` whenever you change cached assets.
- `InstallPwaPrompt.tsx` shows the install card after the splash and onboarding. Closing it asks "Never show this again?"; "Never" is stored in `localStorage` under `archivum_pwa_install`, "Remind me later" snoozes for 3 days.
- The service worker and install prompt only run in production builds (`npm run build && npm start`) over HTTPS or localhost.

## Motion

- `src/app/template.tsx` gives every page a fade-and-rise entrance; cards and tiles stagger in (`motion.css`).
- The bottom nav (`MobileNav.tsx`) has one sliding pill; its look lives only in `motion.css`.
- Toasts and the install card share one style in `src/components/feedback.css`.
- The splash waits until the first real screen is mounted (`archivum:app-ready`, sent by `FirstLaunch`), then fades out over the finished page.

## SEO

- `src/lib/site.ts` holds the site name, description, keywords and URL. Set `NEXT_PUBLIC_SITE_URL` (see `.env.example.seo`) to your real domain.
- `layout.tsx` sets the default title template, Open Graph, Twitter, robots and JSON-LD (WebSite, Organization). Each public page has its own title, description and canonical URL; resource pages add LearningResource + breadcrumb JSON-LD.
- `src/app/sitemap.ts` lists every public page and approved resource; `src/app/robots.ts` blocks admin, API, search and saved pages.

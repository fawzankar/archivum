# ARCHIVUM v77

## New features
- Study space on the home page: streak, daily goal, exam countdown, resume where you left off, tip of the day.
- Focus timer at /focus: rounds and breaks, chime, screen wake lock; minutes feed the study space.
- Recent searches under the search bars.
- Time-aware greeting on home and splash.
- Saved-count badge on the bottom nav.
- All new data stays in the browser (localStorage). Nothing new is sent to a server.

## Splash screen
- Rebuilt: about 3.4 s instead of 6.3 s, tap/Skip/Esc to dismiss, once per session, reduced-motion aware.

## Bottom navigation
- Sliding active pill, Focus tab, saved badge, hides on scroll down, haptic tap, aria-current.

## Copy
- Rewritten in a friendlier voice across home, menu, onboarding, notes, papers, search, tips, contact, about, contributors, saved, resource page, upload, legal pages, errors and toasts.

## Housekeeping
- polish.css is imported last in layout.tsx.
- Search placeholder restored (older CSS had hidden it).
- Service worker bumped to v13 and caches /focus.

## Admin
- Admin screens, toasts and checklist rewritten in plain language.
- Removed the default credentials hint (admin / admin123) from the public login page.

## Menu
- New slide-in menu: profile card with one-tap class switcher, shortcut tiles (Notes, Papers, Focus, Saved with count), link list, colour picker, Quest card.
- New hamburger icon. Esc closes the menu. Fixed a hydration warning in the nav.

## Cleanup (deleted)
- src/app/api/guide (leftover AI chatbot endpoint that called OpenAI), api/blob-upload (410 stub), api/prefetch, api/library-prefetch
- src/components/ReviewsSection.tsx (not imported anywhere)
- patch.py, tsconfig.tsbuildinfo
- public: aboutus.html, archivum-logo-light/mask/official-logo, archivum-mark.svg, splash-gradient-reference.png, zebra-pattern.png, and the default Next.js svgs

## Copy
- Final pass on loading screens, filters and API error messages.

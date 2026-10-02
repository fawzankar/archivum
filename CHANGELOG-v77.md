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

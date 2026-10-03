// One place for everything search engines and link previews need to know about the site.
// Set NEXT_PUBLIC_SITE_URL in your hosting env (e.g. https://your-domain.com) so every canonical link,
// sitemap entry and social preview uses your real domain.
const fromVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || fromVercel || 'https://archivum.vercel.app').replace(/\/+$/, '');
export const SITE_NAME = 'ARCHIVUM';
export const SITE_TITLE = 'ARCHIVUM | Notes, Previous Papers & Study Material for Class 9 to 12';
export const SITE_DESCRIPTION =
  'ARCHIVUM is a free student-built academic archive: chapter-wise notes, previous year question papers, JKBOSE board papers, MCQs and exam tips for Classes 9, 10, 11 and 12. Read online, open it like an app from your home screen.';
export const SITE_TAGLINE = 'Academic notes, previous papers & study material for Classes 9 to 12';
export const AUTHOR = { name: 'Fawzan Kar', url: 'https://linktr.ee/fawzankar' };
export const SISTER_SITE = 'https://sjsquest.vercel.app';
export const INSTAGRAM = 'https://instagram.com/quest_sjs';
export const OG_IMAGE = { url: '/og-image.png', width: 1200, height: 630, alt: 'ARCHIVUM: notes, previous papers and study material for Classes 9 to 12' };

export const KEYWORDS = [
  'ARCHIVUM', 'academic archive', 'study material', 'free study notes', 'class 9 notes', 'class 10 notes', 'class 11 notes', 'class 12 notes',
  'previous year question papers', 'previous papers', 'board exam papers', 'JKBOSE', 'JKBOSE class 10 papers', 'JKBOSE class 12 papers', 'JKBOSE notes',
  'Jammu and Kashmir board', 'SJS students', 'Quest', 'chapter wise notes', 'MCQ practice', 'exam tips and tricks', 'maths notes', 'science notes',
  'physics notes', 'chemistry notes', 'biology notes', 'SST notes', 'English notes', 'Hindi notes', 'Urdu notes', 'study app', 'student PWA',
];

export const absoluteUrl = (path = '/') => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

// Safe to embed inside <script type="application/ld+json">.
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');

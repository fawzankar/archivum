import type { Metadata, Viewport } from 'next';
import '@fontsource/lato/latin-400.css';
import '@fontsource/lato/latin-700.css';
import '@fontsource/lato/latin-900.css';
import './globals.css';
import './hero-v2.css';
import './motion.css';
import { Suspense } from 'react';
import { ThemeProvider } from '@/components/ThemeContext';
import { ToastProvider } from '@/components/ToastContext';
import { StudentClassProvider } from '@/components/StudentClassContext';
import Navbar from '@/components/Navbar';
import MobileNav from '@/components/MobileNav';
import PwaRegister from '@/components/PwaRegister';
import FirstLaunch from '@/components/FirstLaunch';
import ClassTransitionOverlay from '@/components/ClassTransitionOverlay';
import DeferredClientWidgets from '@/components/DeferredClientWidgets';
import NavigationProgress from '@/components/NavigationProgress';
import SplashScreen from '@/components/SplashScreen';
import ConnectionStatus from '@/components/ConnectionStatus';
import PrefetchRoutes from '@/components/PrefetchRoutes';
import AppInteractionGuard from '@/components/AppInteractionGuard';
import TouchFeedback from '@/components/TouchFeedback';
import { BOOT_CSS, BOOT_SCRIPT } from '@/lib/bootSplash';
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION, SITE_TAGLINE, KEYWORDS, AUTHOR, SISTER_SITE, INSTAGRAM, OG_IMAGE, absoluteUrl, jsonLd } from '@/lib/site';

export const viewport: Viewport = { themeColor: '#e4ecff', width: 'device-width', initialScale: 1, maximumScale: 1, userScalable: false, viewportFit: 'cover' };
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: KEYWORDS,
  authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
  creator: AUTHOR.name,
  publisher: SITE_NAME,
  category: 'education',
  referrer: 'origin-when-cross-origin',
  alternates: { canonical: '/' },
  manifest: '/manifest.json',
  formatDetection: { telephone: false, email: false, address: false },
  icons: { icon: [{ url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }, { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }], apple: '/icons/apple-touch-icon.png' },
  appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: 'black-translucent' },
  openGraph: {
    type: 'website', siteName: SITE_NAME, url: '/', locale: 'en_IN',
    title: SITE_TITLE, description: SITE_DESCRIPTION, images: [OG_IMAGE],
  },
  twitter: { card: 'summary_large_image', title: SITE_TITLE, description: SITE_DESCRIPTION, images: [OG_IMAGE.url] },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ? { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } : undefined,
  },
  other: { 'mobile-web-app-capable': 'yes', 'geo.region': 'IN-JK', 'geo.placename': 'Jammu and Kashmir', language: 'English', rating: 'general' },
};

// Structured data: tells Google what the site is, who runs it and that it has its own search.
const STRUCTURED_DATA = [
  {
    '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME,
    alternateName: ['Archivum', 'ARCHIVUM Academic Archive'], description: SITE_DESCRIPTION, inLanguage: 'en-IN',
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` }, 'query-input': 'required name=search_term_string' },
  },
  {
    '@context': 'https://schema.org', '@type': 'EducationalOrganization', '@id': `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL,
    logo: { '@type': 'ImageObject', url: absoluteUrl('/icons/icon-512.png'), width: 512, height: 512 },
    image: absoluteUrl(OG_IMAGE.url), description: SITE_TAGLINE, founder: { '@type': 'Person', name: AUTHOR.name, url: AUTHOR.url },
    sameAs: [SISTER_SITE, INSTAGRAM], areaServed: 'IN',
  },
  {
    '@context': 'https://schema.org', '@type': 'SiteNavigationElement', name: ['Notes', 'Previous Papers', 'Tips & Tricks', 'Contributors', 'About'],
    url: ['/notes', '/previous-papers', '/tips', '/contributors', '/about'].map(absoluteUrl),
  },
];

// Libre Baskerville is used for the QUEST wordmark (splash, header, menu), so it starts loading right away without blocking paint.
const LATE_FONTS = `(function(){var l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@700&display=swap';document.head.appendChild(l)})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: BOOT_CSS }} />
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: LATE_FONTS }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(STRUCTURED_DATA) }} />
      </head>
      <body className="min-h-screen flex flex-col antialiased" style={{ backgroundColor: 'var(--ivory)', color: 'var(--ink)' }}>
        <ThemeProvider><StudentClassProvider><ToastProvider>
          <SplashScreen />
          <ConnectionStatus />
          <AppInteractionGuard />
          <TouchFeedback />
          <PwaRegister /><NavigationProgress /><ClassTransitionOverlay /><FirstLaunch /><PrefetchRoutes />
          <Suspense fallback={null}><Navbar /></Suspense>
          <main className="flex-1">{children}</main>
          <MobileNav /><DeferredClientWidgets />
        </ToastProvider></StudentClassProvider></ThemeProvider>
      </body>
    </html>
  );
}

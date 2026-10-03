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
import PrefetchRoutes from '@/components/PrefetchRoutes';
import AppInteractionGuard from '@/components/AppInteractionGuard';
import { BOOT_CSS, BOOT_SCRIPT } from '@/lib/bootSplash';

export const viewport: Viewport = { themeColor: '#e4ecff', width: 'device-width', initialScale: 1, maximumScale: 1, userScalable: false, viewportFit: 'cover' };
export const metadata: Metadata = {
  title: 'ARCHIVUM | Academic Archive',
  description: 'Academic notes, previous papers, study material and exam resources for SJS students in Classes 9 to 12.',
  manifest: '/manifest.json',
  icons: { icon: [{ url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }, { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }], apple: '/icons/apple-touch-icon.png' },
  appleWebApp: { capable: true, title: 'ARCHIVUM', statusBarStyle: 'black-translucent' },
  openGraph: { title: 'ARCHIVUM | Academic Archive', description: 'A sister organisation of Quest for SJS students.', siteName: 'ARCHIVUM', type: 'website' },
};

// Libre Baskerville is only used for the QUEST wordmark, so it loads after the page instead of blocking the first paint.
const LATE_FONTS = `addEventListener('load',function(){var l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@700&display=swap';document.head.appendChild(l)})`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: BOOT_CSS }} />
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: LATE_FONTS }} />
      </head>
      <body className="min-h-screen flex flex-col antialiased" style={{ backgroundColor: 'var(--ivory)', color: 'var(--ink)' }}>
        <ThemeProvider><StudentClassProvider><ToastProvider>
          <SplashScreen />
          <AppInteractionGuard />
          <PwaRegister /><NavigationProgress /><ClassTransitionOverlay /><FirstLaunch /><PrefetchRoutes />
          <Suspense fallback={null}><Navbar /></Suspense>
          <main className="flex-1">{children}</main>
          <MobileNav /><DeferredClientWidgets />
        </ToastProvider></StudentClassProvider></ThemeProvider>
      </body>
    </html>
  );
}

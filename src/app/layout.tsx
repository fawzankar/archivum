import type { Metadata, Viewport } from 'next';
import '@fontsource/lato/latin-400.css';
import '@fontsource/lato/latin-700.css';
import '@fontsource/lato/latin-900.css';
import './globals.css';
import './hero-v2.css';
import { ThemeProvider } from '@/components/ThemeContext';
import { ToastProvider } from '@/components/ToastContext';
import { StudentClassProvider } from '@/components/StudentClassContext';
import Navbar from '@/components/Navbar';
import MobileNav from '@/components/MobileNav';
import PwaRegister from '@/components/PwaRegister';
import FirstLaunch from '@/components/FirstLaunch';
import { Suspense } from 'react';
import ClassTransitionOverlay from '@/components/ClassTransitionOverlay';
import DeferredClientWidgets from '@/components/DeferredClientWidgets';
import NavigationProgress from '@/components/NavigationProgress';
import SplashScreen from '@/components/SplashScreen';
import PrefetchRoutes from '@/components/PrefetchRoutes';
import AppInteractionGuard from '@/components/AppInteractionGuard';

export const viewport: Viewport = { themeColor: '#e4ecff', width: 'device-width', initialScale: 1, viewportFit: 'cover' };
export const metadata: Metadata = {
  title: 'ARCHIVUM | Academic Archive',
  description: 'Academic notes, previous papers, study material and exam resources for SJS students in Classes 9 to 12.',
  manifest: '/manifest.json',
  icons: { icon: [{ url: '/archivum-icon.png', sizes: '512x512', type: 'image/png' }, { url: '/icon-192.png', sizes: '192x192', type: 'image/png' }], apple: '/archivum-icon.png' },
  appleWebApp: { capable: true, title: 'ARCHIVUM', statusBarStyle: 'black-translucent' },
  openGraph: { title: 'ARCHIVUM | Academic Archive', description: 'A sister organisation of Quest for SJS students.', siteName: 'ARCHIVUM', type: 'website' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /><link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap" rel="stylesheet" /><script dangerouslySetInnerHTML={{__html:`try{if(location.pathname==='/')document.documentElement.classList.add('archivum-booting');}catch(e){}`}} /><script dangerouslySetInnerHTML={{__html:`try{const a=localStorage.getItem('archivum_accent');const t=localStorage.getItem('archivum_theme');const migrated=a==='tangerine'||a==='ink-wash'||a==='golden-taupe'?'smoky-olive':a==='berry'||a==='cherry-blossom'?'soft-pink':a==='ocean'?'crimson-veil':a;if(['indigo','forest','smoky-ink','smoky-olive','soft-pink','crimson-veil'].includes(migrated||''))document.documentElement.setAttribute('data-accent',migrated);}catch(e){}`}} /></head><body className="min-h-screen flex flex-col antialiased" style={{ backgroundColor:'var(--ivory)', color:'var(--ink)' }}>
    <ThemeProvider><StudentClassProvider><ToastProvider><AppInteractionGuard />
      <SplashScreen />
      <PwaRegister /><NavigationProgress /><ClassTransitionOverlay /><FirstLaunch /><PrefetchRoutes />
      <Suspense fallback={null}><Navbar /></Suspense>
      <main className="flex-1">{children}</main>
      <MobileNav /><DeferredClientWidgets />
    </ToastProvider></StudentClassProvider></ThemeProvider>
  </body></html>;
}

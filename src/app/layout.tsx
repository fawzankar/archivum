import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeContext';
import { ToastProvider } from '@/components/ToastContext';
import { StudentClassProvider } from '@/components/StudentClassContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import PwaRegister from '@/components/PwaRegister';
import FirstLaunch from '@/components/FirstLaunch';
import { Suspense } from 'react';
import ClassTransitionOverlay from '@/components/ClassTransitionOverlay';
import DeferredClientWidgets from '@/components/DeferredClientWidgets';

export const viewport: Viewport = {
  themeColor: '#145A73',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'ARCHIVUM — SJS student archive',
  description: 'Notes, previous papers and study material for SJS students in Classes 9–12.',
  keywords: 'SJS, ARCHIVUM, JKBOSE, school notes, previous papers, study material, exam tips',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/archivum-icon.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' }
    ],
    apple: '/archivum-icon.png',
  },
  appleWebApp: { capable: true, title: 'ARCHIVUM', statusBarStyle: 'default' },
  openGraph: {
    title: 'ARCHIVUM — SJS student archive',
    description: 'Notes, previous papers and study material for SJS students in Classes 9–12.',
    siteName: 'ARCHIVUM',
    type: 'website',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased" style={{backgroundColor:'var(--ivory)',color:'var(--ink)'}}>
        <ThemeProvider>
          <StudentClassProvider>
            <ToastProvider>
              <PwaRegister />
              <ClassTransitionOverlay />
              <FirstLaunch />
              <Suspense fallback={null}><Navbar /></Suspense>
              <main className="flex-1">{children}</main>
              <Footer />
              <MobileNav />
              <DeferredClientWidgets />
            </ToastProvider>
          </StudentClassProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

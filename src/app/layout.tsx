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


export const viewport: Viewport = { themeColor: '#111318', width: 'device-width', initialScale: 1, maximumScale: 5, viewportFit: 'cover' };

export const metadata: Metadata = {
  title: 'ARCHIVUM — SJS study archive',
  description: 'A class-wise study archive for SJS students: notes, previous papers and practical exam tips for Classes 9–12.',
  keywords: 'SJS, ARCHIVUM, JKBOSE, school notes, previous papers, study material, exam tips',
  manifest: '/manifest.json',
  icons: { icon: [{ url: '/archivum-logo-light.png', sizes: '1024x1024', type: 'image/png' }, { url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' }], apple: '/archivum-logo-light.png' },
  appleWebApp: { capable: true, title: 'ARCHIVUM', statusBarStyle: 'black-translucent' },
  openGraph: { title: 'ARCHIVUM — SJS study archive', description: 'A sister organisation of SJS Quest for SJS students: notes, papers, study material and exam tips.', siteName: 'ARCHIVUM', type: 'website' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased" style={{ backgroundColor: 'var(--ivory)', color: 'var(--ink)' }}>
        <ThemeProvider>
          <StudentClassProvider>
            <ToastProvider>
              <PwaRegister />
              <ClassTransitionOverlay />
              <FirstLaunch />
              <Suspense fallback={null}>

                <Navbar />

              </Suspense>
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

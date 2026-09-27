import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeContext';
import { ToastProvider } from '@/components/ToastContext';
import { StudentClassProvider } from '@/components/StudentClassContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import Chatbot from '@/components/Chatbot';
import InstallPwaPrompt from '@/components/InstallPwaPrompt';
import PwaRegister from '@/components/PwaRegister';
import FirstLaunch from '@/components/FirstLaunch';
import { Suspense } from 'react';
import ClassTransitionOverlay from '@/components/ClassTransitionOverlay';

export const viewport: Viewport = { themeColor: '#111318', width: 'device-width', initialScale: 1, maximumScale: 5 };

export const metadata: Metadata = {
  title: 'ARCHIVUM — SJS Student Archive',
  description: 'A place for SJS students for all the materials they need — notes, papers, study material and exam tips for Classes 9–12.',
  keywords: 'SJS, ARCHIVUM, JKBOSE, school notes, previous papers, study material, exam tips',
  manifest: '/manifest.json',
  icons: { icon: '/icon-192.png', apple: '/icon-192.png' },
  openGraph: { title: 'ARCHIVUM — SJS Student Archive', description: 'Your class-focused academic archive for SJS students.', siteName: 'ARCHIVUM', type: 'website' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
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
              <Chatbot />
              <InstallPwaPrompt />
            </ToastProvider>
          </StudentClassProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

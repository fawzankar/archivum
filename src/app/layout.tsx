import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeContext';
import { ToastProvider } from '@/components/ToastContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import Chatbot from '@/components/Chatbot';
import InstallPwaPrompt from '@/components/InstallPwaPrompt';
import PwaRegister from '@/components/PwaRegister';

export const viewport: Viewport = {
  themeColor: '#2563EB',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'SJS CONNECT — Find it. Study it. Share it.',
  description: 'School academic resource hub for Classes 9, 10, 11, and 12 (JKBOSE Ecosystem). Access notes, previous year papers, school examination papers, and study material.',
  keywords: 'JKBOSE, Class 10 Science Notes, Class 12 Physics PYQs, Class 9 Math Papers, JKBOSE Board Papers, School Preboard Papers',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
  openGraph: {
    title: 'SJS CONNECT — Find it. Study it. Share it.',
    description: 'School-focused academic resource hub for Classes 9–12.',
    siteName: 'SJS CONNECT',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-screen flex flex-col antialiased"
        style={{ backgroundColor: 'var(--ivory)', color: 'var(--ink)' }}
      >
        <ThemeProvider>
          <ToastProvider>
            <PwaRegister />
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <MobileNav />
            <Chatbot />
            <InstallPwaPrompt />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

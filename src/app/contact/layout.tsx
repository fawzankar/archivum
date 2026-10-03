import type { Metadata } from 'next';
import { OG_IMAGE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact Us: Feedback, Suggestions & Missing Material',
  description: 'Send feedback, report a problem, suggest an improvement or tell us which notes and papers are missing from ARCHIVUM.',
  alternates: { canonical: '/contact' },
  openGraph: { title: 'Contact ARCHIVUM', description: 'Feedback, suggestions and missing-material requests.', url: '/contact', type: 'website', images: [OG_IMAGE] },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}

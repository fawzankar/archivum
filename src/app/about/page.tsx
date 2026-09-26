import React from 'react';
import Link from 'next/link';
import { getContributorLeaderboard } from '@/lib/resources';
import { Smartphone, BookOpen, Check, Shield, Upload, Users, Heart, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'About ARCHIVUM — Our Story & Contributors',
  description: 'Why ARCHIVUM was built: created by a student during exam preparation to make school and JKBOSE study material freely accessible.',
};

export default async function AboutPage() {
  const contributors = await getContributorLeaderboard(8);
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-12 pb-24">
      
      {/* Editorial Header */}
      <div className="space-y-3 border-b pb-8" style={{ borderColor: 'var(--border)' }}>
        <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--sage)' }}>
          FOUNDER&apos;S STORY & MISSION
        </span>
        <h1 className="font-display font-bold text-3xl sm:text-5xl ">
          Why I Built ARCHIVUM
        </h1>
        <p className="font-display italic text-lg sm:text-xl" style={{ color: 'var(--sage)' }}>
          A student project born out of exam season frustration.
        </p>
        <p className="text-xs sm:text-sm  max-w-2xl leading-relaxed">
          I created ARCHIVUM during my own high school exam preparation as I was struggling to find notes, syllabus guides, and examination papers specific to my school and the JKBOSE board.
        </p>
      </div>

      {/* The Personal Story & Vision */}
      <div
        className="rounded-3xl border p-6 sm:p-8 space-y-4 shadow-sm"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <h2 className="font-display font-bold text-xl ">
          The Origin
        </h2>
        <div className="space-y-3 text-xs sm:text-sm  leading-relaxed font-normal">
          <p>
            When exams were around the corner, finding dependable study materials was an overwhelming task. Notes were scattered across unorganized WhatsApp chats, papers from our own school pre-boards were lost, and commercial platforms demanded expensive subscriptions for basic PDFs.
          </p>
          <p>
            I realized my classmates and countless students across Classes 9, 10, 11, and 12 were facing the exact same challenge. So I decided to build <strong>ARCHIVUM</strong>: a clean, fast, mobile-friendly academic repository where any student can find what they need in seconds.
          </p>
          <p>
            Zero accounts required. Zero paywalls. Zero ads. Just authentic chapter notes, solved formula sheets, and past examination papers organized for the way students actually study.
          </p>
        </div>
      </div>

      {/* Contributors */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>CONTRIBUTORS</span>
            <h2 className="font-display font-bold text-xl sm:text-2xl" style={{ color: 'var(--ink)' }}>The people behind the library</h2>
          </div>
        </div>
        <p className="text-xs sm:text-sm max-w-2xl leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
          ARCHIVUM is currently a one-person project. Every part of the platform — design, development, moderation, curation and maintenance — is being handled by its founder.
        </p>
        <div className="rounded-3xl border p-5 sm:p-6 flex items-center gap-4 shadow-sm" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-display font-bold text-lg" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>FK</div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><h3 className="font-display font-bold text-base" style={{ color: 'var(--ink)' }}>Fawzan Kar</h3><span className="text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>Founder · Developer</span></div>
            <p className="text-xs mt-1" style={{ color: 'var(--ink-muted)' }}>Building the platform, curating resources, moderating submissions and keeping ARCHIVUM running.</p>
          </div>
        </div>
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-light)' }}>
            <div><h3 className="font-display font-bold text-base" style={{ color: 'var(--ink)' }}>Contributor leaderboard</h3><p className="text-[10px]" style={{ color: 'var(--ink-faint)' }}>Approved uploads only</p></div>
            <span className="text-[10px] font-bold" style={{ color: 'var(--accent)' }}>{contributors.length} contributor{contributors.length === 1 ? '' : 's'}</span>
          </div>
          {contributors.length ? contributors.map((person, index) => (
            <div key={person.contributor_name} className="flex items-center gap-3 px-5 py-3 border-b last:border-b-0" style={{ borderColor: 'var(--border-light)' }}>
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: index === 0 ? 'var(--accent-light)' : 'var(--surface-raised)', color: 'var(--accent)' }}>#{index + 1}</span>
              <span className="flex-1 text-xs font-semibold" style={{ color: 'var(--ink)' }}>{person.contributor_name}</span>
              <span className="text-[11px]" style={{ color: 'var(--ink-muted)' }}>{person.uploads} upload{person.uploads === 1 ? '' : 's'}</span>
            </div>
          )) : <div className="p-5 text-xs" style={{ color: 'var(--ink-muted)' }}>No approved community uploads with contributor names yet. Your name will appear here after your first approved contribution.</div>}
        </div>
      </section>

      {/* Upload Callout */}
      <div
        className="rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        style={{ backgroundColor: 'var(--sage-light)' }}
      >
        <div className="space-y-1">
          <h3 className="font-display font-bold text-lg sm:text-xl ">
            Have notes or papers to contribute?
          </h3>
          <p className="text-xs  max-w-md">
            Help a fellow student preparing for exams right now. Every upload makes our community repository stronger.
          </p>
        </div>
        <Link
          href="/upload"
          className="px-6 py-3 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer shadow-sm active:scale-95" style={{ backgroundColor: "var(--ink)", color: "var(--surface)" }}
        >
          Upload a Resource →
        </Link>
      </div>

      {/* PWA Section */}
      <div
        className="rounded-3xl border p-6 sm:p-8 space-y-4"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center   shadow-sm">
            <Smartphone className="w-5 h-5" style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <h3 className="font-display font-bold text-base sm:text-lg ">
              Install ARCHIVUM as an App
            </h3>
            <p className="text-xs ">
              Add ARCHIVUM directly to your mobile home screen for quick offline access.
            </p>
          </div>
        </div>

        <div className="space-y-2 text-xs  leading-relaxed pt-2">
          <p><strong>Android / Chrome:</strong> Tap the three dots menu (⋮) at top right and tap &ldquo;Install app&rdquo; or &ldquo;Add to Home screen&rdquo;.</p>
          <p><strong>iOS / Safari:</strong> Tap the Share button at the bottom of Safari and choose &ldquo;Add to Home Screen&rdquo;.</p>
        </div>
      </div>

    </div>
  );
}

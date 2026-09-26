import React from 'react';
import Link from 'next/link';
import { getResources, getRealStats } from '@/lib/resources';
import HomeClient from './HomeClient';
import ResourceCard from '@/components/ResourceCard';
import ReviewsSection from '@/components/ReviewsSection';
import { 
  Sparkles, 
  ArrowRight, 
  Upload, 
  GraduationCap, 
  BookOpen, 
  Check, 
  Atom, 
  Layers, 
  Globe2, 
  FlaskConical, 
  ChevronDown
} from 'lucide-react';

export const revalidate = 0;

export default async function HomePage() {
  // Fetch real database records and real aggregate statistics
  const featuredResources = (await getResources({ featured: true, limit: 3 })).items;
  const recentResources = (await getResources({ sortBy: 'newest', limit: 3 })).items;
  const stats = await getRealStats();

  const classCounts = stats.classCounts;
  const subCounts = stats.subjectCounts;

  // Real subject list with database-driven counts
  const subjectList = [
    { name: 'Mathematics', symbol: 'Σ', colorClass: 'pastel-block-sky', count: subCounts['mathematics'] || 0 },
    { name: 'Science', icon: Atom, colorClass: 'pastel-block-peach', count: subCounts['science'] || 0 },
    { name: 'Physics', icon: Layers, colorClass: 'pastel-block-lavender', count: subCounts['physics'] || 0 },
    { name: 'Chemistry', icon: FlaskConical, colorClass: 'pastel-block-yellow', count: subCounts['chemistry'] || 0 },
    { name: 'English', symbol: 'Aa', colorClass: 'pastel-block-sage', count: subCounts['english'] || 0 },
    { name: 'Social Science', icon: Globe2, colorClass: 'pastel-block-peach', count: subCounts['social science'] || 0 },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-24 font-sans select-none">

      {/* ========================================================= */}
      {/* 1. HERO SECTION (App Optimized)                           */}
      {/* ========================================================= */}
      <section className="pt-4 sm:pt-10 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          
          {/* Left Column (7 cols): Editorial Headline, Tagline, Search */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            
            {/* Top pill badge: "YOUR SCHOOL RESOURCE HUB" */}
            <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase" style={{ color: 'var(--sage)' }}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>YOUR SCHOOL RESOURCE HUB</span>
            </div>

            {/* Massive Serif Display Headline */}
            <h1 className="font-display font-bold text-3xl xs:text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.1]" style={{ color: 'var(--ink)' }}>
              Study smarter.{' '}
              <span className="italic font-normal block sm:inline" style={{ color: 'var(--sage)' }}>
                Go further.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm md:text-base leading-relaxed max-w-xl font-normal" style={{ color: 'var(--ink-muted)' }}>
              Notes, papers and study material for Classes 9–12 — organized for the way you learn.
            </p>

            {/* Interactive Search Bar + ⌘K + Quick Searches */}
            <div className="pt-1 max-w-xl">
              <HomeClient initialSearch="" />
            </div>

          </div>

          {/* Right Column (5 cols): Layered Floating Document Card */}
          <div className="lg:col-span-5 hidden lg:flex justify-center relative">
            <div className="relative w-76 h-68">
              
              {/* Back Card (Layer 1) - tilted paper with lines */}
              <div 
                className="absolute inset-0 rounded-3xl border p-5 shadow-sm transform -rotate-6 translate-x-2 translate-y-2 transition-transform duration-300"
                style={{
                  backgroundColor: 'var(--surface-raised)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="w-16 h-2 rounded bg-zinc-200 dark:bg-zinc-700 mb-4" />
                <div className="space-y-2">
                  <div className="w-full h-1.5 rounded bg-zinc-100 dark:bg-zinc-800" />
                  <div className="w-5/6 h-1.5 rounded bg-zinc-100 dark:bg-zinc-800" />
                  <div className="w-4/6 h-1.5 rounded bg-zinc-100 dark:bg-zinc-800" />
                  <div className="w-3/6 h-1.5 rounded bg-zinc-100 dark:bg-zinc-800" />
                </div>
              </div>

              {/* Main Card (Layer 2) - "Keep learning" */}
              <div 
                className="absolute inset-x-3 inset-y-3 rounded-3xl border p-6 shadow-md transform rotate-2 transition-transform duration-300 flex flex-col justify-between"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[var(--accent-light)] text-[var(--accent)]">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base" style={{ color: 'var(--ink)' }}>
                      Keep learning
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--ink-muted)' }}>
                      One resource at a time
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t" style={{ borderColor: 'var(--border-light)' }}>
                  <div className="flex items-center justify-between text-[11px]" style={{ color: 'var(--ink-muted)' }}>
                    <span>Curated JKBOSE Syllabus</span>
                    <Check className="w-3.5 h-3.5" style={{ color: 'var(--sage)' }} />
                  </div>
                </div>
              </div>

              {/* Floating Pill Badge (Layer 3) - REAL Verified Count */}
              <div 
                className="absolute -bottom-2 -right-2 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 transform -rotate-2"
                style={{
                  backgroundColor: 'var(--ink)',
                  color: 'var(--surface)',
                }}
              >
                <BookOpen className="w-4 h-4 text-[var(--accent)]" />
                <div className="text-left">
                  <div className="text-xs font-bold leading-tight">
                    {stats.totalApproved} Resources
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-zinc-400 font-semibold leading-none">
                    Verified in Library
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. QUICK FIND: "What are you studying today?"             */}
      {/* ========================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4">
        
        {/* Section Header */}
        <div className="flex items-end justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--ink-faint)' }}>
              QUICK FIND
            </span>
            <h2 className="font-display font-bold text-xl sm:text-2xl md:text-3xl" style={{ color: 'var(--ink)' }}>
              What are you studying today?
            </h2>
          </div>

          <Link
            href="/search"
            className="inline-flex items-center gap-1 text-xs font-semibold hover:underline"
            style={{ color: 'var(--ink-muted)' }}
          >
            <span>View all</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* 5 Horizontal Differentiated Blocks (Mobile horizontal carousel, Desktop grid) */}
        <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar snap-x snap-mandatory sm:grid sm:grid-cols-5">
          
          {/* Tile 1: All Resources */}
          <Link
            href="/search"
            className="group p-4 sm:p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs flex flex-col justify-between min-h-[110px] w-38 sm:w-auto shrink-0 snap-start pastel-block-sage app-touch-active"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <span className="text-base font-bold">✦</span>
            </div>
            <div className="flex items-center justify-between font-semibold text-xs mt-3">
              <span>All ({stats.totalApproved})</span>
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Tile 2: Class 9 */}
          <Link
            href="/notes?class=9"
            className="group p-4 sm:p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs flex flex-col justify-between min-h-[110px] w-38 sm:w-auto shrink-0 snap-start pastel-block-peach app-touch-active"
            style={{ borderColor: 'var(--border)' }}
          >
            <span className="font-display font-bold text-2xl">
              9
            </span>
            <div className="flex items-center justify-between font-semibold text-xs mt-3">
              <span>Class 9 ({classCounts[9] || 0})</span>
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Tile 3: Class 10 */}
          <Link
            href="/notes?class=10"
            className="group p-4 sm:p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs flex flex-col justify-between min-h-[110px] w-38 sm:w-auto shrink-0 snap-start pastel-block-sky app-touch-active"
            style={{ borderColor: 'var(--border)' }}
          >
            <span className="font-display font-bold text-2xl">
              10
            </span>
            <div className="flex items-center justify-between font-semibold text-xs mt-3">
              <span>Class 10 ({classCounts[10] || 0})</span>
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Tile 4: Class 11 */}
          <Link
            href="/notes?class=11"
            className="group p-4 sm:p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs flex flex-col justify-between min-h-[110px] w-38 sm:w-auto shrink-0 snap-start pastel-block-lavender app-touch-active"
            style={{ borderColor: 'var(--border)' }}
          >
            <span className="font-display font-bold text-2xl">
              11
            </span>
            <div className="flex items-center justify-between font-semibold text-xs mt-3">
              <span>Class 11 ({classCounts[11] || 0})</span>
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Tile 5: Class 12 */}
          <Link
            href="/notes?class=12"
            className="group p-4 sm:p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs flex flex-col justify-between min-h-[110px] w-38 sm:w-auto shrink-0 snap-start pastel-block-yellow app-touch-active"
            style={{ borderColor: 'var(--border)' }}
          >
            <span className="font-display font-bold text-2xl">
              12
            </span>
            <div className="flex items-center justify-between font-semibold text-xs mt-3">
              <span>Class 12 ({classCounts[12] || 0})</span>
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. CURATED FOR YOU: "Featured resources"                  */}
      {/* ========================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4">
        
        <div className="flex items-end justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--ink-faint)' }}>
              CURATED FOR YOU
            </span>
            <h2 className="font-display font-bold text-xl sm:text-2xl md:text-3xl" style={{ color: 'var(--ink)' }}>
              Featured resources
            </h2>
          </div>

          <Link
            href="/notes"
            className="inline-flex items-center gap-1 text-xs font-semibold hover:underline"
            style={{ color: 'var(--ink-muted)' }}
          >
            <span>Explore library</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* 3-Column Editorial Cards with Pastel Top Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {featuredResources.map((res) => (
            <ResourceCard key={res.id} resource={res} />
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. BROWSE BY SUBJECT: "Find your focus" (Real counts)     */}
      {/* ========================================================= */}
      <section className="py-6 sm:py-8 transition-colors border-y" style={{ borderColor: 'var(--border-light)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4">
          
          <div className="flex items-end justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--ink-faint)' }}>
                BROWSE BY SUBJECT
              </span>
              <h2 className="font-display font-bold text-xl sm:text-2xl md:text-3xl" style={{ color: 'var(--ink)' }}>
                Find your focus
              </h2>
            </div>

            <Link
              href="/search"
              className="inline-flex items-center gap-1 text-xs font-semibold hover:underline"
              style={{ color: 'var(--ink-muted)' }}
            >
              <span>All subjects</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* 6 Subject Cards (App-like touch carousel on mobile, grid on desktop) */}
          <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar snap-x snap-mandatory sm:grid sm:grid-cols-3 lg:grid-cols-6">
            {subjectList.map((sub) => {
              const Icon = sub.icon;
              return (
                <Link
                  key={sub.name}
                  href={`/search?subject=${encodeURIComponent(sub.name)}`}
                  className="group p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs flex flex-col justify-between w-36 sm:w-auto shrink-0 snap-start app-touch-active"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${sub.colorClass}`}
                  >
                    {sub.symbol ? sub.symbol : Icon && <Icon className="w-4 h-4" />}
                  </div>

                  <div className="mt-3 space-y-0.5">
                    <div className="font-bold text-xs group-hover:text-[var(--accent)] transition-colors" style={{ color: 'var(--ink)' }}>
                      {sub.name}
                    </div>
                    <div className="flex items-center justify-between text-[11px]" style={{ color: 'var(--ink-muted)' }}>
                      <span>{sub.count} {sub.count === 1 ? 'item' : 'items'}</span>
                      <ArrowRight className="w-2.5 h-2.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. THE LIBRARY: "Recently added"                          */}
      {/* ========================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4">
        
        <div className="flex items-end justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--ink-faint)' }}>
              THE LIBRARY
            </span>
            <h2 className="font-display font-bold text-xl sm:text-2xl md:text-3xl" style={{ color: 'var(--ink)' }}>
              Recently added
            </h2>
          </div>

          <Link
            href="/search?sort=newest"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--ink-muted)' }}
          >
            <span>All resources</span>
            <ChevronDown className="w-3 h-3" />
          </Link>
        </div>

        {/* 3-Column Recently Added Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {recentResources.map((res) => (
            <ResourceCard key={res.id} resource={res} />
          ))}
        </div>
      </section>

      <ReviewsSection />

      {/* ========================================================= */}
      {/* 6. SHARE THE KNOWLEDGE (Upload Callout Banner)            */}
      {/* ========================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div 
          className="rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          style={{ backgroundColor: 'var(--sage-light)' }}
        >
          {/* Left: Icon + Text */}
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs" style={{ backgroundColor: 'var(--surface)', color: 'var(--sage)' }}>
              <Upload className="w-5 h-5 stroke-[2]" />
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--sage)' }}>
                SHARE THE KNOWLEDGE
              </span>
              <h3 className="font-display font-bold text-xl sm:text-2xl leading-tight" style={{ color: 'var(--ink)' }}>
                Have useful notes or papers?
              </h3>
              <p className="text-xs sm:text-sm max-w-xl leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
                Help a fellow student find what they need. Every contribution is reviewed before it goes live.
              </p>
            </div>
          </div>

          {/* Right: Charcoal Pill Button */}
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-xs sm:text-sm text-white bg-zinc-900 hover:bg-zinc-800 transition-all shrink-0 shadow-sm active:scale-95 cursor-pointer"
          >
            <span>Upload a resource</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

        </div>
      </section>

    </div>
  );
}

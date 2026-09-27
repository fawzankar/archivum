import Link from 'next/link';
import { ArrowRight, Archive, Heart, MessageCircle, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <section className="rounded-[2.5rem] border overflow-hidden" style={{background:'var(--surface)',borderColor:'var(--border)'}}>
        <div className="p-7 sm:p-12" style={{background:'var(--hero-gradient)'}}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{background:'var(--accent)',color:'var(--accent-contrast)'}}>
            <Archive className="w-7 h-7"/>
          </div>
          <p className="mt-8 text-[10px] uppercase tracking-[.25em] font-bold" style={{color:'var(--accent-on-hero)'}}>ABOUT ARCHIVUM</p>
          <h1 className="font-display text-4xl sm:text-6xl font-bold mt-2" style={{color:'var(--hero-ink)'}}>Built from a problem I faced myself.</h1>
          <p className="mt-5 max-w-2xl text-sm sm:text-base leading-7" style={{color:'var(--hero-muted)'}}>ARCHIVUM is a student-built place for SJS students to preserve, discover and share useful academic material.</p>
        </div>

        <div className="p-7 sm:p-12 space-y-10">
          <div className="prose prose-zinc max-w-none">
            <p className="text-sm sm:text-base leading-7" style={{color:'var(--ink-muted)'}}>
              When I was actually being really attentive about previous-year papers and finding quick notes, I realised how difficult it was to get everything I needed in one reliable place. Finding a particular paper could take a lot of time, and useful notes were often scattered around.
            </p>
            <p className="text-sm sm:text-base leading-7 mt-5" style={{color:'var(--ink-muted)'}}>
              I also had my juniors asking me for previous-year papers. Unfortunately, when I received some of those papers at the time, I just went through them and moved on, so they were not properly stored or preserved for the future.
            </p>
            <p className="text-sm sm:text-base leading-7 mt-5" style={{color:'var(--ink-muted)'}}>
              That is what led me to ARCHIVUM: a simple archive for preserving these documents and making them easier to find for my fellow Josephites. The idea is not just to collect files, but to make useful material easier to discover when someone actually needs it.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            {[
              ['Preserve','Keep useful papers and notes from disappearing.','Archive'],
              ['Discover','Find material by class, subject and type.','Search'],
              ['Contribute','Help the next student by sharing useful work.','Share'],
            ].map(([title,body,icon]) => (
              <div key={title} className="rounded-3xl border p-5" style={{background:'var(--surface-raised)',borderColor:'var(--border)'}}>
                <div className="text-[10px] uppercase tracking-[.18em] font-bold" style={{color:'var(--accent)'}}>{icon}</div>
                <h2 className="font-display font-bold text-lg mt-3">{title}</h2>
                <p className="text-xs leading-5 mt-2" style={{color:'var(--ink-muted)'}}>{body}</p>
              </div>
            ))}
          </div>


          <div className="rounded-3xl border p-6 sm:p-8" style={{background:'var(--surface-raised)',borderColor:'var(--border)'}}>
            <p className="text-[10px] uppercase tracking-[.18em] font-bold" style={{color:'var(--accent)'}}>SISTER ORGANISATION</p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mt-2">
              <div>
                <h2 className="font-display font-bold text-2xl">ARCHIVUM × SJS Quest</h2>
                <p className="text-sm leading-6 mt-2 max-w-2xl" style={{color:'var(--ink-muted)'}}>ARCHIVUM is a sister organisation of SJS Quest, the St. Joseph's School, Baramulla newsletter club. SJS Quest focuses on school stories, magazines and creative work; ARCHIVUM focuses on preserving and finding academic material.</p>
              </div>
              <a href="https://sjsquest.vercel.app" target="_blank" rel="noopener noreferrer" className="shrink-0 inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-xs font-bold" style={{background:'var(--accent)',color:'var(--accent-contrast)'}}>Visit SJS Quest <ArrowRight className="w-3.5 h-3.5"/></a>
            </div>
          </div>

          <div className="rounded-3xl border p-6 sm:p-8" style={{background:'var(--accent-light)',borderColor:'color-mix(in srgb,var(--accent) 22%,var(--border))'}}>
            <div className="flex gap-4">
              <Heart className="w-5 h-5 shrink-0 mt-0.5" style={{color:'var(--accent)'}}/>
              <div>
                <h2 className="font-display font-bold text-xl">Want ARCHIVUM for your school?</h2>
                <p className="text-sm leading-6 mt-2" style={{color:'var(--ink-muted)'}}>
                  If you want a similar archive for your own school, message me and ask for the code. I’m happy to provide it for free.
                </p>
                <a href="https://linktr.ee/fawzankar" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-5 rounded-full px-4 py-2.5 text-xs font-bold" style={{background:'var(--accent)',color:'var(--accent-contrast)'}}>
                  Message / find Fawzan <ArrowRight className="w-3.5 h-3.5"/>
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/contributors" className="inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-xs font-bold" style={{borderColor:'var(--border)'}}>Meet contributors <ArrowRight className="w-3.5 h-3.5"/></Link>
            <Link href="/upload" className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold" style={{background:'var(--accent)',color:'var(--accent-contrast)'}}>Contribute material <ArrowRight className="w-3.5 h-3.5"/></Link>
          </div>
        </div>
      </section>
    </main>
  );
}

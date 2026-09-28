import Link from 'next/link';
import { ArrowRight, Archive, Heart, MessageCircle, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <section className="rounded-xl border overflow-hidden" style={{background:'var(--surface)',borderColor:'var(--border)'}}>
        <div className="p-7 sm:p-12" style={{background:'var(--hero-gradient)'}}>
          <div className="w-14 h-14 rounded-lg flex items-center justify-center" style={{background:'var(--accent)',color:'var(--accent-contrast)'}}>
            <Archive className="w-7 h-7"/>
          </div>
          <p className="mt-8 text-[10px] uppercase tracking-[.25em] font-bold" style={{color:'var(--accent-on-hero)'}}>ABOUT ARCHIVUM</p>
          <p className="text-[10px] uppercase tracking-[.2em] font-medium mt-6" style={{color:'var(--hero-muted)'}}>FOUNDER OF ARCHIVUM · FAWZAN KAR</p>
          <h1 className="font-display text-4xl sm:text-6xl font-bold mt-2" style={{color:'var(--hero-ink)'}}>Built from a problem Fawzan Kar faced himself.</h1>
          <p className="mt-5 max-w-2xl text-sm sm:text-base leading-7" style={{color:'var(--hero-muted)'}}>ARCHIVUM is a student-built place for SJS students to preserve, discover and share useful academic material.</p>
        </div>

        <div className="p-7 sm:p-12 space-y-10">
          <div className="prose prose-zinc max-w-none">
            <p className="text-sm sm:text-base leading-7" style={{color:'var(--ink-muted)'}}>
              Fawzan Kar, the founder of ARCHIVUM, had firsthand experience with how difficult it could be to find previous-year papers and quick notes in one reliable place. Finding a particular paper could take a lot of time, and useful notes were often scattered around.
            </p>
            <p className="text-sm sm:text-base leading-7 mt-5" style={{color:'var(--ink-muted)'}}>
              His juniors also asked him for previous-year papers. Unfortunately, when he received some of those papers at the time, he went through them and moved on, so they were not properly stored or preserved for the future.
            </p>
            <p className="text-sm sm:text-base leading-7 mt-5" style={{color:'var(--ink-muted)'}}>
              That experience led Fawzan Kar to create ARCHIVUM: a simple archive for preserving these documents and making them easier to find for fellow Josephites. The idea is not just to collect files, but to make useful material easier to discover when someone actually needs it.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            {[
              ['Preserve','Keep useful papers and notes from disappearing.','Archive'],
              ['Discover','Find material by class, subject and type.','Search'],
              ['Contribute','Help the next student by sharing useful work.','Share'],
            ].map(([title,body,icon]) => (
              <div key={title} className="rounded-xl border p-5" style={{background:'var(--surface-raised)',borderColor:'var(--border)'}}>
                <div className="text-[10px] uppercase tracking-[.18em] font-bold" style={{color:'var(--accent)'}}>{icon}</div>
                <h2 className="font-display font-bold text-lg mt-3">{title}</h2>
                <p className="text-xs leading-5 mt-2" style={{color:'var(--ink-muted)'}}>{body}</p>
              </div>
            ))}
          </div>


          <div className="rounded-xl border p-6 sm:p-8" style={{background:'var(--surface-raised)',borderColor:'var(--border)'}}>
            <p className="text-[10px] uppercase tracking-[.18em] font-bold" style={{color:'var(--accent)'}}>SISTER ORGANISATION</p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mt-2">
              <div>
                <h2 className="font-display font-bold text-2xl">ARCHIVUM × <span className="quest-word">QUEST</span></h2>
                <p className="text-sm leading-6 mt-2 max-w-2xl" style={{color:'var(--ink-muted)'}}>ARCHIVUM is a sister organisation of SJS <span className="quest-word">QUEST</span>, the St. Joseph's School, Baramulla newsletter club. <span className="quest-word">QUEST</span> focuses on school stories, magazines and creative work; ARCHIVUM focuses on preserving and finding academic material.</p>
              </div>
              <a href="https://sjsquest.vercel.app" target="_blank" rel="noopener noreferrer" className="shrink-0 inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 text-xs font-bold" style={{background:'var(--accent)',color:'var(--accent-contrast)'}}><span className="quest-word">VISIT QUEST</span> <ArrowRight className="w-3.5 h-3.5"/></a>
            </div>
          </div>

          <div className="rounded-xl border p-6 sm:p-8" style={{background:'var(--accent-light)',borderColor:'color-mix(in srgb,var(--accent) 22%,var(--border))'}}>
            <div className="flex gap-4">
              <Heart className="w-5 h-5 shrink-0 mt-0.5" style={{color:'var(--accent)'}}/>
              <div>
                <h2 className="font-display font-bold text-xl">Want ARCHIVUM for your school?</h2>
                <p className="text-sm leading-6 mt-2" style={{color:'var(--ink-muted)'}}>
                  If another school wants a similar archive, they can message Fawzan Kar and ask for the code. He is happy to provide it for free.
                </p>
                <a href="https://linktr.ee/fawzankar" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-5 rounded-md px-4 py-2.5 text-xs font-bold" style={{background:'var(--accent)',color:'var(--accent-contrast)'}}>
                  Message / find Fawzan <ArrowRight className="w-3.5 h-3.5"/>
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/contributors" className="inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-3 text-xs font-bold" style={{borderColor:'var(--border)'}}>Meet contributors <ArrowRight className="w-3.5 h-3.5"/></Link>
            <Link href="/subjects" className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-xs font-bold" style={{background:'var(--accent)',color:'var(--accent-contrast)'}}>Explore the archive <ArrowRight className="w-3.5 h-3.5"/></Link>
          </div>
        </div>
      </section>
    </main>
  );
}

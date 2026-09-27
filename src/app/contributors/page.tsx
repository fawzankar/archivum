import { query } from '@/lib/db';
import { Users, Upload, Trophy } from 'lucide-react';

export const dynamic = 'force-dynamic';

type Contributor = { contributor_name: string; uploads: number; latest_title: string | null; latest_id: number | null };

export default async function ContributorsPage() {
  const contributors = await query<Contributor>(`
    SELECT contributor_name, COUNT(*) as uploads,
      (SELECT r2.title FROM resources r2 WHERE r2.status='approved' AND r2.contributor_name = resources.contributor_name ORDER BY r2.created_at DESC LIMIT 1) as latest_title,
      (SELECT r3.id FROM resources r3 WHERE r3.status='approved' AND r3.contributor_name = resources.contributor_name ORDER BY r3.created_at DESC LIMIT 1) as latest_id
    FROM resources
    WHERE status = 'approved'
      AND contributor_name IS NOT NULL
      AND TRIM(contributor_name) != ''
    GROUP BY contributor_name
    ORDER BY uploads DESC, contributor_name ASC
    LIMIT 50
  `);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <section className="rounded-[2.5rem] border p-7 sm:p-12" style={{background:'var(--hero-gradient)',borderColor:'var(--border)'}}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{background:'var(--accent)',color:'var(--accent-contrast)'}}><Users className="w-7 h-7"/></div>
        <p className="mt-7 text-[10px] uppercase tracking-[.24em] font-bold" style={{color:'var(--accent-on-hero)'}}>ARCHIVUM CONTRIBUTORS</p>
        <h1 className="font-display font-bold text-4xl sm:text-5xl mt-2" style={{color:'var(--hero-ink)'}}>People building the archive.</h1>
        <p className="max-w-2xl mt-4 text-sm leading-6" style={{color:'var(--hero-muted)'}}>A live list based on approved material actually uploaded to ARCHIVUM. No inflated contributor numbers.</p>
      </section>

      <section className="mt-7 grid gap-3">
        {contributors.length === 0 ? (
          <div className="rounded-3xl border p-10 text-center" style={{background:'var(--surface)',borderColor:'var(--border)'}}>
            <Trophy className="w-8 h-8 mx-auto" style={{color:'var(--accent)'}}/>
            <h2 className="font-display font-bold text-xl mt-3">No contributors yet</h2>
            <p className="text-xs mt-2" style={{color:'var(--ink-muted)'}}>Be the first to have approved material listed here.</p>
          </div>
        ) : contributors.map((c, i) => (
          <div key={c.contributor_name} className="rounded-3xl border p-4 sm:p-5 flex items-center gap-4" style={{background:'var(--surface)',borderColor:'var(--border)'}}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-display font-bold" style={{background:'var(--accent-light)',color:'var(--accent)'}}>{i+1}</div>
            <div className="min-w-0 flex-1"><div className="font-display font-medium truncate">{c.contributor_name}</div><div className="text-[11px] mt-1 truncate" style={{color:'var(--ink-muted)'}}>{c.latest_title ? `Latest: ${c.latest_title}` : 'Approved contributor'}</div></div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold" style={{background:'var(--surface-raised)',color:'var(--ink-muted)'}}><Upload className="w-3.5 h-3.5"/>{c.uploads} {c.uploads === 1 ? 'upload' : 'uploads'}</div>
          </div>
        ))}
      </section>
    </main>
  );
}

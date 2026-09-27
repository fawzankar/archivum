import { query } from '@/lib/db';
import { Upload } from 'lucide-react';

export const dynamic = 'force-dynamic';

type Contributor = { contributor_name: string; uploads: number; latest_title: string | null; latest_id: number | null };

export default async function ContributorsPage() {
  const contributors = await query<Contributor>(`
    SELECT contributor_name, COUNT(*) as uploads,
      (SELECT r2.title FROM resources r2 WHERE r2.status='approved' AND r2.contributor_name = resources.contributor_name ORDER BY r2.created_at DESC LIMIT 1) as latest_title,
      (SELECT r3.id FROM resources r3 WHERE r3.status='approved' AND r3.contributor_name = resources.contributor_name ORDER BY r3.created_at DESC LIMIT 1) as latest_id
    FROM resources
    WHERE status = 'approved' AND contributor_name IS NOT NULL AND TRIM(contributor_name) != ''
    GROUP BY contributor_name
    ORDER BY uploads DESC, contributor_name ASC
    LIMIT 50
  `);

  return (
    <main className="archive-shell">
      <div className="page-heading">
        <span className="eyebrow">Contributors</span>
        <h1>The students who help keep it useful.</h1>
        <p>These names come from approved resources that have actually been shared with the archive.</p>
      </div>

      <section className="page-section pt-7">
        {contributors.length === 0 ? (
          <div className="archive-surface p-10 text-center">
            <h2 className="text-xl font-semibold">No contributors are listed yet.</h2>
            <p className="text-sm mt-2" style={{color:'var(--ink-muted)'}}>Share a useful resource and your name can appear here after approval.</p>
          </div>
        ) : (
          <div className="border-y" style={{borderColor:'var(--border)'}}>
            {contributors.map(c => (
              <div key={c.contributor_name} className="py-5 grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_180px] gap-5 items-center border-b last:border-b-0" style={{borderColor:'var(--border-light)'}}>
                <div className="min-w-0">
                  <h2 className="text-base font-semibold truncate">{c.contributor_name}</h2>
                  <p className="text-sm mt-1 truncate" style={{color:'var(--ink-muted)'}}>{c.latest_title || 'Approved archive contributor'}</p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-2 text-sm font-medium" style={{color:'var(--accent)'}}><Upload className="w-4 h-4" /> {c.uploads}</div>
                  <div className="text-xs mt-1" style={{color:'var(--ink-faint)'}}>{c.uploads === 1 ? 'approved upload' : 'approved uploads'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

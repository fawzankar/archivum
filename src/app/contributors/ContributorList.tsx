'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ASearch as Search } from '@/components/AnimatedIcons';

export type Contributor = { contributor_name: string; uploads: number; latest_title: string | null; latest_id: number | null };

const TONES = ['sun', 'peri', 'blush', 'mint'];
const MEDALS = ['gold', 'silver', 'bronze'];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] || '?').slice(0, 2)).toUpperCase();
}
function toneOf(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return TONES[h % TONES.length];
}

export default function ContributorList({ list }: { list: Contributor[] }) {
  const [q, setQ] = useState('');
  const top = list[0]?.uploads || 1;
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return list.map((c, i) => ({ c, rank: i + 1 })).filter(({ c }) => !needle || c.contributor_name.toLowerCase().includes(needle));
  }, [list, q]);

  return (
    <>
      {list.length > 8 && (
        <label className="cbx-search">
          <Search />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a contributor" aria-label="Find a contributor" />
        </label>
      )}
      {rows.length === 0 ? (
        <p className="cbx-note">No contributor matches “{q}”.</p>
      ) : (
        <ol className="cbx-list">
          {rows.map(({ c, rank }) => (
            <li key={c.contributor_name}>
              <span className={`cbx-rank${rank <= 3 ? ` medal ${MEDALS[rank - 1]}` : ''}`}>{rank}</span>
              <span className={`cbx-av tone-${toneOf(c.contributor_name)}`} aria-hidden="true">{initials(c.contributor_name)}</span>
              <div className="cbx-main">
                <strong>{c.contributor_name}{rank === 1 && <em>Top contributor</em>}</strong>
                {c.latest_title && (c.latest_id
                  ? <Link href={`/resource/${c.latest_id}`} prefetch={false}>Latest: {c.latest_title}</Link>
                  : <span>Latest: {c.latest_title}</span>)}
                <i className="cbx-bar" aria-hidden="true"><b style={{ width: `${Math.max(6, Math.round((c.uploads / top) * 100))}%` }} /></i>
              </div>
              <span className="cbx-count"><b>{c.uploads}</b>{c.uploads === 1 ? 'upload' : 'uploads'}</span>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}

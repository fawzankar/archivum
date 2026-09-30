import { unstable_cache } from 'next/cache';
import { execute, initDb, query, queryOne } from './db';

export interface Tip {
  id:number;
  class_level:number;
  subject:string;
  title:string;
  body:string;
  author:string|null;
  status:'pending'|'approved'|'rejected';
  created_at:string;
}

const TIP_COLUMNS = 'id, class_level, subject, title, body, author, status, created_at';

async function getApprovedTipsBundleUncached(): Promise<Tip[]> {
  await initDb();
  return query<Tip>(`SELECT ${TIP_COLUMNS} FROM tips WHERE status='approved' ORDER BY created_at DESC LIMIT 300`);
}

// Tips follows the same pattern as Notes/PYQs: one small cached bundle is rendered
// into the page, so class/subject switches do not need another server request.
export const getTipsBundle = unstable_cache(getApprovedTipsBundleUncached, ['tips-bundle-v2'], {
  revalidate: 300,
  tags: ['tips'],
});

export async function getTips(classLevel?: number, subject?: string, limit=12) {
  const safeLimit = Math.min(Math.max(limit,1),30);
  const all = await getTipsBundle();
  const filtered = all.filter(t =>
    (!classLevel || t.class_level === classLevel) &&
    (!subject || subject === 'All' || t.subject === subject || t.subject === 'General')
  );
  return filtered.slice(0, safeLimit);
}

export const getTipsForPage = (classLevel: number, subject?: string, limit=12) => unstable_cache(
  async () => {
    const all = await getTipsBundle();
    return all.filter(t => t.class_level === classLevel && (!subject || subject === 'All' || t.subject === subject || t.subject === 'General')).slice(0, Math.min(Math.max(limit,1),30));
  },
  ['tips-page-v2', String(classLevel), subject || 'All', String(limit)],
  { revalidate: 300, tags: ['tips'] },
)();

export async function createTip(classLevel:number, subject:string, title:string, body:string, author:string|null) {
  await initDb();
  return execute(`INSERT INTO tips (class_level,subject,title,body,author,status,created_at) VALUES (?,?,?,?,?, 'pending',?)`, [classLevel,subject,title,body,author,new Date().toISOString()]);
}

export async function getPendingTips() { await initDb(); return query<Tip>(`SELECT ${TIP_COLUMNS} FROM tips WHERE status='pending' ORDER BY created_at DESC`); }
export async function getTipStats() { await initDb(); return queryOne<{pending:number;approved:number}>(`SELECT SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending, SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) AS approved FROM tips`); }

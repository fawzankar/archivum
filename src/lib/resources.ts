import crypto from 'crypto';
import { unstable_cache } from 'next/cache';
import { execute, initDb, query, queryOne } from './db';

export interface Resource {
  id: number; slug: string; title: string; description: string | null; class_level: number; board: string;
  subject: string; chapter: string | null; topic: string | null; resource_type: string; paper_type: string | null;
  year: number | null; school_name: string | null; contributor_name: string | null; file_url: string; file_size: number; file_type: string;
  file_name: string; storage_key: string | null; file_hash: string | null; status: 'pending'|'approved'|'rejected'|'deleted'; rejection_reason: string | null;
  featured: number; views: number; downloads: number; average_rating: number; rating_count: number; tags: string | null;
  created_at: string; updated_at: string; approved_at: string | null; photo_keys: string | null;
}

export interface ResourceFilterOptions {
  class_level?: number; subject?: string; resource_type?: string; paper_type?: string; year?: number;
  school_name?: string; chapter?: string; topic?: string; search?: string; status?: string; featured?: boolean;
  sortBy?: 'relevance'|'newest'|'downloads'|'rating'; page?: number; limit?: number; withCount?: boolean;
}

export function generateSlug(title: string): string {
  const base = title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
  return `${base}-${crypto.randomInt(1000, 10000)}`;
}
export function computeFileHash(buffer: Buffer) { return crypto.createHash('md5').update(buffer).digest('hex'); }
export function sanitizeFilename(filename: string) { return filename.replace(/[^a-zA-Z0-9_.-]/g, '_'); }

async function getResourcesUncached(options: ResourceFilterOptions = {}) {
  await initDb();
  const { class_level, subject, resource_type, paper_type, year, school_name, chapter, topic, search, status='approved', featured,
    sortBy='newest', page=1, limit=20, withCount=true } = options;
  const safePage = Number.isFinite(page) && page! > 0 ? Math.floor(page!) : 1;
  const safeLimit = Number.isFinite(limit) && limit! > 0 ? Math.min(Math.floor(limit!), 200) : 20;
  const where: string[] = []; const params: (string|number)[] = [];
  if (status) { where.push('status = ?'); params.push(status); }
  if (class_level) { where.push('class_level = ?'); params.push(class_level); }
  if (subject) { where.push('subject = ?'); params.push(subject); }
  if (resource_type) { where.push('resource_type = ?'); params.push(resource_type); }
  if (paper_type) { where.push('paper_type = ?'); params.push(paper_type); }
  if (year) { where.push('year = ?'); params.push(year); }
  if (school_name) { where.push('LOWER(school_name) LIKE ?'); params.push(`%${school_name.toLowerCase()}%`); }
  if (chapter) { where.push('LOWER(chapter) LIKE ?'); params.push(`%${chapter.toLowerCase()}%`); }
  if (topic) { where.push('LOWER(topic) LIKE ?'); params.push(`%${topic.toLowerCase()}%`); }
  if (featured !== undefined) { where.push('featured = ?'); params.push(featured ? 1 : 0); }
  if (search?.trim()) {
    const q = `%${search.trim().toLowerCase()}%`;
    where.push(`(LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(subject) LIKE ? OR LOWER(chapter) LIKE ? OR LOWER(topic) LIKE ? OR LOWER(tags) LIKE ? OR LOWER(school_name) LIKE ? OR LOWER(resource_type) LIKE ? OR LOWER(paper_type) LIKE ?)`);
    params.push(...Array(9).fill(q));
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const orderSql = sortBy === 'downloads' ? 'ORDER BY downloads DESC, created_at DESC' : sortBy === 'rating' ? 'ORDER BY average_rating DESC, rating_count DESC, created_at DESC' : sortBy === 'relevance' && search ? 'ORDER BY featured DESC, views DESC, downloads DESC' : 'ORDER BY created_at DESC';
  const offset = (safePage - 1) * safeLimit;
  const items = await query<Resource>(
    `SELECT * FROM resources ${whereSql} ${orderSql} LIMIT ? OFFSET ?`,
    [...params, safeLimit, offset],
  );
  if (!withCount) {
    return { items, totalCount: items.length, totalPages: 1, currentPage: safePage };
  }
  const totalRow = await queryOne<{count:number}>(`SELECT COUNT(*) AS count FROM resources ${whereSql}`, params);
  const totalCount = Number(totalRow?.count ?? items.length);
  return { items, totalCount, totalPages: Math.ceil(totalCount / safeLimit) || 1, currentPage: safePage };
}

export async function getResources(options: ResourceFilterOptions = {}) {
  const normalized = {
    ...options,
    status: options.status ?? 'approved',
    page: options.page ?? 1,
    limit: options.limit ?? 20,
    sortBy: options.sortBy ?? 'newest',
  };
  if (normalized.status !== 'approved') return getResourcesUncached(normalized);
  const key = JSON.stringify(normalized);
  return unstable_cache(
    () => getResourcesUncached(normalized),
    ['resources', key],
    { revalidate: 300 }
  )();
}

// ---- Library bundle -------------------------------------------------------------------
// ONE cached query returns every approved Note + Previous Paper, grouped by class. The
// Notes / Papers pages are statically generated from it, and it is also shipped to the
// browser (localStorage + service worker) so those pages never need an API call to render.
export interface LibraryBundle {
  notes: Record<number, Resource[]>;
  papers: Record<number, Resource[]>;
  generatedAt: number;
}

const CARD_COLUMNS = `id, slug, title, NULL AS description, class_level, board, subject, chapter, topic,
  resource_type, paper_type, year, school_name, contributor_name, file_url, file_size, file_type, file_name,
  NULL AS storage_key, NULL AS file_hash, status, NULL AS rejection_reason, featured, views, downloads,
  average_rating, rating_count, NULL AS tags, created_at, updated_at, approved_at, NULL AS photo_keys`;


export interface RecentHomeBundle {
  9: Resource[];
  10: Resource[];
  11: Resource[];
  12: Resource[];
}

const getRecentHomeBundleUncached = async (): Promise<RecentHomeBundle> => {
  const rows = await query<Resource>(
    `SELECT ${CARD_COLUMNS} FROM resources
     WHERE status = 'approved'
     ORDER BY created_at DESC
     LIMIT 120`,
  );
  const grouped: RecentHomeBundle = { 9: [], 10: [], 11: [], 12: [] };
  for (const row of rows) {
    if (grouped[row.class_level as 9|10|11|12] && grouped[row.class_level as 9|10|11|12].length < 6) {
      grouped[row.class_level as 9|10|11|12].push(row);
    }
  }
  return grouped;
};

export const getRecentHomeBundle = unstable_cache(
  getRecentHomeBundleUncached,
  ['home-recent-bundle-v1'],
  { revalidate: 300, tags: ['library'] },
);

async function getLibraryBundleUncached(): Promise<LibraryBundle> {
  const rows = await query<Resource>(
    `SELECT ${CARD_COLUMNS} FROM resources
     WHERE status = 'approved' AND resource_type IN ('Notes', 'Previous Year Paper')
     ORDER BY created_at DESC LIMIT 1500`,
  );
  const notes: Record<number, Resource[]> = { 9: [], 10: [], 11: [], 12: [] };
  const papers: Record<number, Resource[]> = { 9: [], 10: [], 11: [], 12: [] };
  for (const row of rows) {
    const target = row.resource_type === 'Notes' ? notes : papers;
    (target[row.class_level] ||= []).push(row);
  }
  return { notes, papers, generatedAt: Date.now() };
}

export const getLibraryBundle = unstable_cache(getLibraryBundleUncached, ['library-bundle-v1'], {
  revalidate: 300,
  tags: ['library'],
});

// Safe wrapper for pages: a database hiccup must never break the build or the page.
export async function getLibraryBundleSafe(): Promise<LibraryBundle> {
  try {
    return await getLibraryBundle();
  } catch {
    return { notes: { 9: [], 10: [], 11: [], 12: [] }, papers: { 9: [], 10: [], 11: [], 12: [] }, generatedAt: 0 };
  }
}

const getResourceByIdCached = (id:number) => unstable_cache(
  () => queryOne<Resource>('SELECT * FROM resources WHERE id = ?', [id]),
  ['resource-by-id', String(id)],
  { revalidate: 300 }
)();

const getResourceBySlugCached = (slug:string) => unstable_cache(
  () => queryOne<Resource>('SELECT * FROM resources WHERE slug = ?', [slug]),
  ['resource-by-slug', slug],
  { revalidate: 300 }
)();

export async function getResourceById(id:number) { return getResourceByIdCached(id); }
export async function getResourceBySlug(slug:string) { return getResourceBySlugCached(slug); }

export async function getRelatedResources(resource:Resource, limit=4) {
  return unstable_cache(() => getRelatedResourcesUncached(resource, limit), ['related', String(resource.id), String(limit)], { revalidate: 300, tags: ['library'] })();
}

async function getRelatedResourcesUncached(resource:Resource, limit=4) {
  const items = await query<Resource>(`SELECT * FROM resources WHERE status='approved' AND id != ? AND class_level = ? AND (subject = ? OR resource_type = ? OR chapter = ?) ORDER BY (CASE WHEN subject = ? THEN 3 ELSE 0 END + CASE WHEN chapter = ? THEN 2 ELSE 0 END + CASE WHEN resource_type = ? THEN 1 ELSE 0 END) DESC, downloads DESC LIMIT ?`, [resource.id,resource.class_level,resource.subject,resource.resource_type,resource.chapter,resource.subject,resource.chapter,resource.resource_type,limit]);
  if (items.length >= limit) return items;
  const ids = [resource.id, ...items.map(i=>i.id)];
  const placeholders = ids.map(()=>'?').join(',');
  const fallback = await query<Resource>(`SELECT * FROM resources WHERE status='approved' AND id NOT IN (${placeholders}) AND class_level=? ORDER BY downloads DESC LIMIT ?`, [...ids,resource.class_level,limit-items.length]);
  return [...items,...fallback];
}

export async function incrementViewCount(id:number) { await execute('UPDATE resources SET views = views + 1 WHERE id = ? AND status = \'approved\'', [id]); }

export async function incrementDownloadCount(id:number, sessionId:string) {
  const normalized = sessionId.trim().slice(0,128); if (!normalized) return false;
  const recent = await queryOne<{id:number}>('SELECT id FROM downloads WHERE resource_id=? AND session_id=? AND created_at > datetime(\'now\', \'-5 minutes\') LIMIT 1',[id,normalized]);
  if (recent) return false;
  const resource = await getResourceById(id); if (!resource || resource.status !== 'approved') return false;
  await execute('INSERT INTO downloads (resource_id,session_id,created_at) VALUES (?,?,?)',[id,normalized,new Date().toISOString()]);
  await execute("UPDATE resources SET downloads = downloads + 1 WHERE id = ? AND status = 'approved'",[id]);
  return true;
}

export async function rateResource(id: number, sessionId: string, rating: number) {
  const normalizedSession = sessionId.trim().slice(0, 128);
  if (!normalizedSession) return { success: false, message: 'Something went wrong with your session. Refresh and try rating again.' };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { success: false, message: 'Rating must be between 1 and 5 stars.' };
  }

  const resource = await queryOne<{ id: number; status: string }>(
    `SELECT id,status FROM resources WHERE id=? LIMIT 1`,
    [id],
  );
  if (!resource || resource.status !== 'approved') {
    return { success: false, message: 'This one can’t be rated right now.' };
  }

  const now = new Date().toISOString();

  // One rating per browser session, but allow that same user to change their rating.
  // This is a true SQLite/Turso upsert rather than INSERT OR IGNORE, so a previous
  // rating can never make the UI silently fail.
  await execute(
    `INSERT INTO ratings (resource_id,session_id,rating,created_at)
     VALUES (?,?,?,?)
     ON CONFLICT(resource_id,session_id)
     DO UPDATE SET rating=excluded.rating, created_at=excluded.created_at`,
    [id, normalizedSession, rating, now],
  );

  const stats = await queryOne<{ avg_rating: number | null; count: number }>(
    `SELECT AVG(rating) AS avg_rating, COUNT(*) AS count
     FROM ratings WHERE resource_id=?`,
    [id],
  );

  const count = Number(stats?.count ?? 0);
  const average = count > 0 ? Math.round(Number(stats?.avg_rating ?? 0) * 10) / 10 : 0;

  await execute(
    `UPDATE resources SET average_rating=?, rating_count=?, updated_at=? WHERE id=?`,
    [average, count, now, id],
  );

  return {
    success: true,
    message: 'Rating saved.',
    average_rating: average,
    rating_count: count,
    user_rating: rating,
  };
}

export async function checkForDuplicates(fileHash:string,title:string,classLevel:number,subject:string) {
  if (fileHash) {
    const hashMatch = await queryOne<{id:number;title:string;slug:string}>('SELECT id,title,slug FROM resources WHERE file_hash=? LIMIT 1',[fileHash]);
    if (hashMatch) return {isDuplicate:true,reason:'This exact file is already in the archive.',existing:hashMatch};
  }
  const similar = await queryOne<{id:number;title:string;slug:string}>('SELECT id,title,slug FROM resources WHERE LOWER(title)=LOWER(?) AND class_level=? AND LOWER(subject)=LOWER(?) LIMIT 1',[title,classLevel,subject]);
  if (similar) return {isDuplicate:true,reason:'Something with this title, class and subject is already in the archive.',existing:similar};
  return {isDuplicate:false};
}

async function getRealStatsUncached() {
  const [total, classRows, subjectRows, totals] = await Promise.all([
    queryOne<{count:number}>("SELECT COUNT(*) AS count FROM resources WHERE status='approved'"),
    query<{class_level:number;count:number}>("SELECT class_level,COUNT(*) AS count FROM resources WHERE status='approved' GROUP BY class_level"),
    query<{sub:string;count:number}>("SELECT LOWER(subject) AS sub,COUNT(*) AS count FROM resources WHERE status='approved' GROUP BY LOWER(subject)"),
    queryOne<{downloads:number;views:number}>("SELECT COALESCE(SUM(downloads),0) AS downloads,COALESCE(SUM(views),0) AS views FROM resources WHERE status='approved'"),
  ]);
  return {
    totalApproved:Number(total?.count??0),
    classCounts:Object.fromEntries(classRows.map(r=>[r.class_level,Number(r.count)])),
    subjectCounts:Object.fromEntries(subjectRows.map(r=>[r.sub,Number(r.count)])),
    totalDownloads:Number(totals?.downloads??0),
    totalViews:Number(totals?.views??0)
  };
}

export const getRealStats = unstable_cache(
  getRealStatsUncached,
  ['real-stats'],
  { revalidate: 300 }
);


export async function getContributorLeaderboard(limit = 10) {
  return query<{ contributor_name: string; uploads: number }>(
    `SELECT contributor_name, COUNT(*) AS uploads
     FROM resources
     WHERE status='approved' AND contributor_name IS NOT NULL AND TRIM(contributor_name) <> ''
     GROUP BY contributor_name
     ORDER BY uploads DESC, contributor_name ASC
     LIMIT ?`,
    [Math.min(Math.max(limit, 1), 20)],
  );
}

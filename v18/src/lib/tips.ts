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

export async function getTips(classLevel?: number, subject?: string, limit=12) {
  await initDb();
  const safeLimit = Math.min(Math.max(limit,1),30);
  if (classLevel && subject && subject !== 'All') {
    return query<Tip>(`SELECT * FROM tips WHERE status='approved' AND class_level=? AND (subject=? OR subject='General') ORDER BY RANDOM() LIMIT ?`, [classLevel, subject, safeLimit]);
  }
  if (classLevel) return query<Tip>(`SELECT * FROM tips WHERE status='approved' AND class_level=? ORDER BY RANDOM() LIMIT ?`, [classLevel, safeLimit]);
  return query<Tip>(`SELECT * FROM tips WHERE status='approved' ORDER BY RANDOM() LIMIT ?`, [safeLimit]);
}

export async function createTip(classLevel:number, subject:string, title:string, body:string, author:string|null) {
  await initDb();
  return execute(`INSERT INTO tips (class_level,subject,title,body,author,status,created_at) VALUES (?,?,?,?,?, 'pending',?)`, [classLevel,subject,title,body,author,new Date().toISOString()]);
}

export async function getPendingTips() { await initDb(); return query<Tip>(`SELECT * FROM tips WHERE status='pending' ORDER BY created_at DESC`); }
export async function getTipStats() { await initDb(); return queryOne<{pending:number;approved:number}>(`SELECT SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending, SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) AS approved FROM tips`); }

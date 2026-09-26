import { execute, initDb, query, queryOne } from './db';

export interface Tip { id:number; class_level:number; title:string; body:string; author:string|null; status:'pending'|'approved'|'rejected'; created_at:string; }

export async function getTips(classLevel?: number, limit=12) {
  await initDb();
  if (classLevel) return query<Tip>(`SELECT * FROM tips WHERE status='approved' AND class_level=? ORDER BY RANDOM() LIMIT ?`, [classLevel, Math.min(Math.max(limit,1),30)]);
  return query<Tip>(`SELECT * FROM tips WHERE status='approved' ORDER BY RANDOM() LIMIT ?`, [Math.min(Math.max(limit,1),30)]);
}

export async function createTip(classLevel:number, title:string, body:string, author:string|null) {
  await initDb();
  return execute(`INSERT INTO tips (class_level,title,body,author,status,created_at) VALUES (?,?,?,?, 'pending',?)`, [classLevel,title,body,author,new Date().toISOString()]);
}

export async function getPendingTips() { await initDb(); return query<Tip>(`SELECT * FROM tips WHERE status='pending' ORDER BY created_at DESC`); }
export async function getTipStats() { await initDb(); return queryOne<{pending:number;approved:number}>(`SELECT SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending, SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) AS approved FROM tips`); }

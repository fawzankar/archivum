import { execute, initDb, query } from './db';

export interface Feedback {
  id:number; name:string|null; email:string|null; message:string; status:'new'|'read'|'archived'; created_at:string;
}

export async function createFeedback(name:string|null,email:string|null,message:string){
  await initDb();
  return execute(`INSERT INTO feedback (name,email,message,status,created_at) VALUES (?,?,?,'new',?)`,[name,email,message,new Date().toISOString()]);
}

export async function getFeedback(){ await initDb(); return query<Feedback>(`SELECT * FROM feedback ORDER BY CASE status WHEN 'new' THEN 0 WHEN 'read' THEN 1 ELSE 2 END, created_at DESC`); }

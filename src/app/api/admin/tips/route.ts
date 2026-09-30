import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getAdminSession } from '@/lib/auth';
import { execute, initDb } from '@/lib/db';
import { getPendingTips } from '@/lib/tips';

export async function GET(){ if(!(await getAdminSession())) return NextResponse.json({error:'Unauthorized'},{status:401}); await initDb(); return NextResponse.json({tips:await getPendingTips()}); }
export async function POST(request:Request){
  if(!(await getAdminSession())) return NextResponse.json({error:'Unauthorized'},{status:401});
  const body=await request.json(); const id=Number(body.id); const status=body.status;
  if(!Number.isInteger(id)||!['approved','rejected'].includes(status)) return NextResponse.json({error:'Invalid request'},{status:400});
  await execute('UPDATE tips SET status=? WHERE id=?',[status,id]);
  revalidateTag('tips', { expire: 0 });
  return NextResponse.json({success:true});
}

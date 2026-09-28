import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { execute } from '@/lib/db';
import { getFeedback } from '@/lib/feedback';

export async function GET(){ if(!(await getAdminSession())) return NextResponse.json({error:'Unauthorized'},{status:401}); return NextResponse.json({feedback:await getFeedback()}); }
export async function POST(request:Request){
  if(!(await getAdminSession())) return NextResponse.json({error:'Unauthorized'},{status:401});
  const body=await request.json(); const id=Number(body.id); const status=body.status;
  if(!Number.isInteger(id)||!['new','read','archived'].includes(status)) return NextResponse.json({error:'Invalid feedback update.'},{status:400});
  await execute(`UPDATE feedback SET status=? WHERE id=?`,[status,id]);
  return NextResponse.json({success:true});
}

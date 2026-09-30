import { revalidateTag, revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
export async function POST(request:Request){
  if(!(await getAdminSession())) return NextResponse.json({error:'Unauthorized admin access'},{status:401});
  try { const {id,reason}=await request.json(); const n=Number(id); if(!Number.isInteger(n)||n<=0)return NextResponse.json({error:'Resource ID is required'},{status:400}); const now=new Date().toISOString(); const r=await execute("UPDATE resources SET status='rejected',rejection_reason=?,updated_at=? WHERE id=?",[reason||'Quality or metadata non-compliance',now,n]); revalidateTag('library', { expire: 0 }); revalidatePath('/notes'); revalidatePath('/previous-papers'); if(!r.rowsAffected)return NextResponse.json({error:'Resource not found'},{status:404}); return NextResponse.json({success:true,message:'Resource rejected'}); } catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Rejection failed'},{status:500});}
}

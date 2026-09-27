import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
export async function POST(request:Request){
  if(!(await getAdminSession())) return NextResponse.json({error:'Unauthorized admin access'},{status:401});
  try { const {id,featured}=await request.json(); const n=Number(id); if(!Number.isInteger(n)||n<=0||typeof featured!=='boolean')return NextResponse.json({error:'Missing id or featured status'},{status:400}); await execute('UPDATE resources SET featured=?,updated_at=? WHERE id=?',[featured?1:0,new Date().toISOString(),n]); return NextResponse.json({success:true,featured}); } catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Feature update failed'},{status:500});}
}

import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { deleteStoredFile } from '@/lib/storage';
import { queryOne } from '@/lib/db';
export async function POST(request:Request){
  if(!(await getAdminSession())) return NextResponse.json({error:'Unauthorized admin access'},{status:401});
  try {
    const {id,permanent}=await request.json();
    const n=Number(id);
    if(!Number.isInteger(n)||n<=0)return NextResponse.json({error:'Resource ID is required'},{status:400});
    const resource=await queryOne<{file_url:string;storage_key:string|null}>('SELECT file_url,storage_key FROM resources WHERE id=?',[n]);
    if(!resource)return NextResponse.json({error:'Resource not found'},{status:404});
    if(permanent) {
      await execute('DELETE FROM resources WHERE id=?',[n]);
      if(resource.storage_key || resource.file_url) await deleteStoredFile(resource.storage_key || resource.file_url).catch(()=>{});
    } else {
      await execute("UPDATE resources SET status='deleted',updated_at=? WHERE id=?",[new Date().toISOString(),n]);
    }
    return NextResponse.json({success:true,message:permanent?'Resource permanently deleted':'Resource soft-deleted'});
  } catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Deletion failed'},{status:500});}
}

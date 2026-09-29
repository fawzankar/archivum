import { PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { createFeedback } from '@/lib/feedback';
import { getR2Client, getR2PublicUrl } from '@/lib/storage';

export const runtime='nodejs';
const MAX=10*1024*1024;
const TYPES=new Set(['application/pdf','image/jpeg','image/png','image/webp']);
function safeName(value:string){ return value.replace(/[^a-zA-Z0-9._-]/g,'-').slice(0,150); }
export async function POST(request:Request){
 try{
  const form=await request.formData();
  const name=String(form.get('name')||'').trim().slice(0,80);
  const email=String(form.get('email')||'').trim().slice(0,160);
  const classLevel=Number(form.get('classLevel'));
  const section=String(form.get('section')||'').trim().slice(0,20);
  const message=String(form.get('message')||'').trim().slice(0,3000);
  if(!name||!email||![9,10,11,12].includes(classLevel)||message.length<5) return NextResponse.json({error:'Please add your email, choose your class and write a message.'},{status:400});
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({error:'Please enter a valid email address.'},{status:400});
  const entries=form.getAll('attachments').filter((entry): entry is File => entry instanceof File).slice(0,6);
  for(const file of entries) if(file.size>MAX||!TYPES.has(file.type)) return NextResponse.json({error:'Each attachment must be a PDF or image under 10 MB.'},{status:400});
  const stored:string[]=[];
  const r2=getR2Client();
  for(const file of entries){
    const filename=`feedback/${Date.now()}-${crypto.randomUUID()}-${safeName(file.name)}`;
    if(r2 && process.env.R2_BUCKET_NAME){
      await r2.send(new PutObjectCommand({Bucket:process.env.R2_BUCKET_NAME,Key:filename,Body:Buffer.from(await file.arrayBuffer()),ContentType:file.type}));
      stored.push(getR2PublicUrl(filename));
    } else {
      stored.push(file.name);
    }
  }
  await createFeedback(name,email,classLevel,section,message,stored);
  return NextResponse.json({success:true});
 }catch(error){ return NextResponse.json({error:error instanceof Error?error.message:'Could not send feedback.'},{status:500}); }
}

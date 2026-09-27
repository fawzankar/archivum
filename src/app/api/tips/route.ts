import { NextResponse } from 'next/server';
import { createTip, getTips } from '@/lib/tips';
import { subjectsForClass } from '@/lib/subjects';
import { initDb } from '@/lib/db';

export const dynamic='force-dynamic';

export async function GET(request:Request){
  await initDb();
  const params = new URL(request.url).searchParams;
  const classLevel=Number(params.get('class'));
  const subject=params.get('subject') || undefined;
  return NextResponse.json({tips:await getTips([9,10,11,12].includes(classLevel)?classLevel:undefined, subject, 12)});
}

export async function POST(request:Request){
  try {
    await initDb();
    const body=await request.json();
    const classLevel=Number(body.class_level);
    const subject=typeof body.subject==='string'?body.subject.trim().slice(0,40):'';
    const title=typeof body.title==='string'?body.title.trim().slice(0,120):'';
    const text=typeof body.body==='string'?body.body.trim().slice(0,600):'';
    const author=typeof body.author==='string'?body.author.trim().slice(0,80):'';
    const allowedSubjects=[9,10,11,12].includes(classLevel) ? subjectsForClass(classLevel) : [];
    if(![9,10,11,12].includes(classLevel)||!allowedSubjects.includes(subject)||!author||title.length<4||text.length<15) {
      return NextResponse.json({error:'Choose a class and subject, enter your name, and provide a useful tip (15–600 characters).'}, {status:400});
    }
    await createTip(classLevel,subject,title,text,author);
    return NextResponse.json({success:true,message:'Tip submitted for moderation.'});
  } catch(error){ return NextResponse.json({error:error instanceof Error?error.message:'Could not submit tip.'},{status:500}); }
}

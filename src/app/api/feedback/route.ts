import { NextResponse } from 'next/server';
import { createFeedback } from '@/lib/feedback';

export async function POST(request:Request){
  try{
    const body=await request.json();
    const name=typeof body.name==='string'?body.name.trim().slice(0,80):'';
    const email=typeof body.email==='string'?body.email.trim().slice(0,160):'';
    const message=typeof body.message==='string'?body.message.trim().slice(0,2000):'';
    if(message.length<5) return NextResponse.json({error:'Please write a little more so we can act on your feedback.'},{status:400});
    if(email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({error:'Please enter a valid email address.'},{status:400});
    await createFeedback(name||null,email||null,message);
    return NextResponse.json({success:true});
  }catch(error){ return NextResponse.json({error:error instanceof Error?error.message:'Could not send feedback.'},{status:500}); }
}

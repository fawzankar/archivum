import { NextResponse } from 'next/server';
import { rateResource } from '@/lib/resources';
export async function POST(request:Request){ try { const {resourceId,sessionId,rating}=await request.json(); const id=Number(resourceId); const sid=String(sessionId||'').trim(); if(!Number.isInteger(id)||id<=0||!sid)return NextResponse.json({error:'Invalid rating request'},{status:400}); return NextResponse.json(await rateResource(id,sid,Number(rating))); } catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Rating failed'},{status:500});} }

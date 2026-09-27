import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
export async function GET(){ if(!(await getAdminSession())) return NextResponse.json({error:'Unauthorized admin access'},{status:401}); const items=await query("SELECT * FROM resources WHERE status='pending' ORDER BY created_at DESC"); return NextResponse.json({items}); }

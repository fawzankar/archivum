import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { signAdminToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) return NextResponse.json({ error:'Username and password are required' }, { status:400 });
    const admin = await queryOne<{id:number;username:string;password_hash:string}>('SELECT id,username,password_hash FROM admin_users WHERE username=? LIMIT 1',[String(username).trim()]);
    if (!admin || !(await bcrypt.compare(String(password), admin.password_hash))) return NextResponse.json({ error:'Invalid admin credentials' }, { status:401 });
    const token = signAdminToken({id:admin.id,username:admin.username});
    const response = NextResponse.json({success:true,message:'Admin login successful'});
    response.cookies.set('sjs_admin_token',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*24*7});
    return response;
  } catch (error:unknown) {
    return NextResponse.json({error:error instanceof Error?error.message:'Login failed'},{status:500});
  }
}

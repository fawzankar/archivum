import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === 'production' ? '' : 'dev-only-sjs-connect-secret-change-me');
const COOKIE_NAME = 'sjs_admin_token';

export interface AdminPayload {
  id: number;
  username: string;
}

export function signAdminToken(payload: AdminPayload): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET must be configured in production');
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyAdminToken(token: string): AdminPayload | null {
  if (!JWT_SECRET) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as AdminPayload;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export function getAdminSessionFromRequestCookie(cookieHeader: string | null): AdminPayload | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  return verifyAdminToken(match[1]);
}

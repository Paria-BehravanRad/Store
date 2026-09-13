import { cookies } from 'next/headers';
import type { AuthUser } from './auth-types';
import { isAdminRole } from './auth-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function getServerSession(): Promise<AuthUser | null> {
  const jar = await cookies();
  const access = jar.get('access_token')?.value;
  const cookieHeader = jar
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  if (!access && !cookieHeader) {
    return null;
  }

  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      cache: 'no-store',
    });
    if (!res.ok) {
      return null;
    }
    return (await res.json()) as AuthUser;
  } catch {
    return null;
  }
}

export async function requireAdminSession(): Promise<AuthUser> {
  const user = await getServerSession();
  if (!user || !isAdminRole(user.role)) {
    throw new Error('FORBIDDEN');
  }
  return user;
}

export { isAdminRole };

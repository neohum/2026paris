import { logout } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  await logout();
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const baseUrl = host ? `${protocol}://${host}` : request.url;
  return NextResponse.redirect(new URL('/', baseUrl), { status: 302 });
}

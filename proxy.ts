import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/auth';

export default async function proxy(request: NextRequest) {
  // 인증이 필요한 경로들
  const protectedRoutes = ['/dashboard', '/flights', '/map', '/forms', '/ledger'];
  const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  // 로그인, 가입 페이지 접근 시 이미 로그인되어 있으면 대시보드로 이동
  const isAuthRoute = request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/signup';

  const session = request.cookies.get('session')?.value;

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 세션 만료 시간 갱신
  return (await updateSession(request)) ?? NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|uploads).*)'],
};

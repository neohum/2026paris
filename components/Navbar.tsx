'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './Navbar.css';

export default function Navbar({ user }: { user: any }) {
  const pathname = usePathname();
  
  // 로그인, 회원가입 페이지는 네비게이션을 숨깁니다.
  if (pathname === '/' || pathname === '/signup') return null;

  return (
    <nav className="navbar glass">
      <div className="nav-brand">
        <Link href="/dashboard">🇫🇷 Paris 2026</Link>
      </div>
      <div className="nav-links">
        <Link href="/dashboard" className={pathname === '/dashboard' ? 'active' : ''}>대시보드</Link>
        <Link href="/flights" className={pathname === '/flights' ? 'active' : ''}>항공권 검색</Link>
        <Link href="/map" className={pathname === '/map' ? 'active' : ''}>지도/일정</Link>
        <Link href="/forms" className={pathname === '/forms' ? 'active' : ''}>정보 폼</Link>
        <Link href="/ledger" className={pathname === '/ledger' ? 'active' : ''}>가계부</Link>
        {user?.username === 'neohum' && (
          <Link href="/admin" className={pathname === '/admin' ? 'active' : ''} style={{ color: '#10b981', fontWeight: 700 }}>정보 총괄(★)</Link>
        )}
      </div>
      <div className="nav-user">
        <span>{user?.name}님</span>
        <form action="/api/auth/logout" method="POST">
          <button type="submit" className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.9rem' }}>로그아웃</button>
        </form>
      </div>
    </nav>
  );
}

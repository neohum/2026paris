'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './Navbar.css';

export default function Navbar({ user }: { user: any }) {
  const pathname = usePathname();
  
  // 로그인, 회원가입 페이지는 네비게이션을 숨깁니다.
  if (pathname === '/' || pathname === '/signup') return null;

  return (
    <>
      <header className="mobile-header">
        <div className="nav-brand">
          <Link href="/dashboard">🇫🇷 Itinéraire</Link>
        </div>
        <div className="nav-user">
          <span className="user-name">{user?.name}</span>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="btn-logout">Logout</button>
          </form>
        </div>
      </header>
      
      <nav className="mobile-nav-tabs">
        <Link href="/dashboard" className={`nav-item ${pathname === '/dashboard' ? 'active' : ''}`}>
          <span>홈</span>
        </Link>
        <Link href="/flights" className={`nav-item ${pathname === '/flights' ? 'active' : ''}`}>
          <span>비행기</span>
        </Link>
        <Link href="/map" className={`nav-item ${pathname === '/map' ? 'active' : ''}`}>
          <span>일정지도</span>
        </Link>
        <Link href="/paris" className={`nav-item ${pathname === '/paris' ? 'active' : ''}`}>
          <span>투표결과</span>
        </Link>
        <Link href="/checklist" className={`nav-item ${pathname === '/checklist' ? 'active' : ''}`}>
          <span>준비물</span>
        </Link>
        <Link href="/ledger" className={`nav-item ${pathname === '/ledger' ? 'active' : ''}`}>
          <span>가계부</span>
        </Link>
        <Link href="/forms" className={`nav-item ${pathname === '/forms' ? 'active' : ''}`}>
          <span>정보입력</span>
        </Link>
        {user?.username === 'neohum' && (
          <Link href="/admin" className={`nav-item admin-nav ${pathname === '/admin' ? 'active' : ''}`}>
            <span>총괄(★)</span>
          </Link>
        )}
      </nav>
    </>
  );
}

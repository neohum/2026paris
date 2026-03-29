import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import './dashboard.css';

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) {
    redirect('/');
  }

  // 전체 회원 수 및 정보 제출 완료 수 (가상 로직 - 나중에 members_info 조회 반영 가능)
  const usersRes = await query('SELECT count(*) FROM users');
  const infoRes = await query('SELECT count(*) FROM member_info');
  const totalUsers = parseInt(usersRes.rows[0].count);
  const infoSubmitted = parseInt(infoRes.rows[0].count);

  // 디데이 계산
  const targetDate = new Date('2026-07-30T00:00:00+09:00');
  const today = new Date();
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="dashboard-container">
      <h1 className="page-title">환영합니다, {user.name}님! 👋</h1>
      
      <div className="dday-card glass text-center">
        <h2>프랑스 파리 여행까지</h2>
        <div className="dday-number">D-{diffDays}</div>
        <p>2026.07.30 (목) ~ 08.13 (목)</p>
      </div>

      <div className="status-grid">
        <div className="status-card glass">
          <h3>👥 참여 멤버 현황</h3>
          <div className="status-number">{totalUsers}명 완료</div>
          <p>전체 목표 인원: 6명</p>
        </div>
        <div className="status-card glass">
          <h3>🛂 여권 및 정보 등록</h3>
          <div className="status-number">{infoSubmitted} / {totalUsers}</div>
          <p>등록 완료</p>
          {infoSubmitted < totalUsers && (
            <Link href="/forms" className="action-link mt-2">미등록 멤버 입력하기 →</Link>
          )}
        </div>
      </div>

      <h2 className="section-title mt-5">빠른 이동</h2>
      <div className="menu-grid">
        <Link href="/flights" className="menu-card glass">
          <div className="menu-icon">✈️</div>
          <h3>항공권 및 일정 추천</h3>
          <p>가장 저렴한 6인 왕복 옵션 확인</p>
        </Link>
        <Link href="/map" className="menu-card glass">
          <div className="menu-icon">🗺️</div>
          <h3>지도 & 일정</h3>
          <p>렌터카로 이동하는 3가지 코스</p>
        </Link>
        <Link href="/forms" className="menu-card glass">
          <div className="menu-icon">📝</div>
          <h3>여행자 정보 폼</h3>
          <p>여권 사본 및 비상연락망</p>
        </Link>
        <Link href="/ledger" className="menu-card glass">
          <div className="menu-icon">💶</div>
          <h3>여행 가계부</h3>
          <p>공동 경비 지출 내역 및 정산</p>
        </Link>
      </div>
    </div>
  );
}

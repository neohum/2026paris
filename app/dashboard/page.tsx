import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DdayCard from './DdayCard';
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
      <h1 className="page-title">Bienvenue, {user.name} 👋</h1>
      
      <DdayCard diffDays={diffDays} />

      <div className="status-grid">
        <div className="status-card glass">
          <h3>👥 참여 멤버 현황</h3>
          <div className="status-number">{totalUsers}명</div>
          <p>전체 목표 인원: 6명</p>
        </div>
        <div className="status-card glass">
          <h3>🛂 여권 등 안내 정보</h3>
          <div className="status-number">{infoSubmitted} / {totalUsers}</div>
          <p>정보 등록 완료</p>
          {infoSubmitted < totalUsers && (
            <Link href="/forms" className="action-link mt-2">미등록 멤버 입력하기 →</Link>
          )}
        </div>
      </div>

      <h2 className="section-title mt-5">빠른 시작</h2>
      <div className="menu-grid">
        <Link href="/flights" className="menu-card glass">
          <div className="menu-icon">✈️</div>
          <div className="menu-text">
            <h3>항공권 추천</h3>
            <p>최저가 비행기 옵션 및 팀원 투표</p>
          </div>
        </Link>
        <Link href="/map" className="menu-card glass">
          <div className="menu-icon">🗺️</div>
          <div className="menu-text">
            <h3>일정 및 장소</h3>
            <p>날짜별 세부 일정과 이동경로</p>
          </div>
        </Link>
        <Link href="/forms" className="menu-card glass">
          <div className="menu-icon">📝</div>
          <div className="menu-text">
            <h3>정보 제출</h3>
            <p>비상연락망 및 여행자 정보 입력</p>
          </div>
        </Link>
        <Link href="/ledger" className="menu-card glass">
          <div className="menu-icon">💶</div>
          <div className="menu-text">
            <h3>가계부</h3>
            <p>공동 경비 지출 내역 및 정산</p>
          </div>
        </Link>
        <Link href="/paris" className="menu-card glass">
          <div className="menu-icon">🗼</div>
          <div className="menu-text">
            <h3>일정 투표</h3>
            <p>호텔 및 렌터카 투표 결과</p>
          </div>
        </Link>
        <Link href="/checklist" className="menu-card glass" style={{ borderColor: 'var(--primary)' }}>
          <div className="menu-icon">🎒</div>
          <div className="menu-text">
            <h3 style={{ color: 'var(--primary)' }}>준비물</h3>
            <p>여행 출발 전 꼭 챙겨야 할 물품</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

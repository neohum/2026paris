'use client';

import { useState, useEffect } from 'react';

type MemberInfo = {
  id: number;
  user_name: string;
  passport_last_name: string;
  passport_first_name: string;
  passport_number: string;
  passport_expiry: string;
  birth_date: string;
  emergency_contact: string;
  notes: string;
  photo_path: string | null;
  submitted_at: string;
};

export default function AdminPage() {
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/admin/members');
        if (res.ok) {
          const data = await res.json();
          setMembers(data);
        } else {
          // 권한이 없으면 대시보드로 이동
          window.location.href = '/dashboard';
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>로딩 중...</div>;

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <h1 className="page-title" style={{ color: '#10b981' }}>👑 멤버 전체 정보 조회 (Admin)</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        이 페이지는 관리자(neohum) 계정에서만 접근 가능합니다. 예약 및 관리에 필요한 모든 제출 정보를 확인하세요.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {members.map(member => (
          <div key={member.id} className="glass" style={{ padding: '2rem', position: 'relative' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
              👤 {member.user_name}
            </h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>여권 영문명</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{member.passport_last_name} {member.passport_first_name}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>여권 번호</p>
                <p style={{ fontWeight: '600' }}>{member.passport_number}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>만료일</p>
                <p style={{ fontWeight: '600', color: new Date(member.passport_expiry) < new Date('2026-08-30') ? '#ef4444' : 'inherit' }}>
                  {new Date(member.passport_expiry).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>생년월일</p>
                <p>{new Date(member.birth_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>비상 연락처</p>
                <p>{member.emergency_contact}</p>
              </div>
            </div>

            {member.notes && (
              <div style={{ marginBottom: '1.5rem', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>특이사항 (알레르기 등)</p>
                <p style={{ fontSize: '0.95rem' }}>{member.notes}</p>
              </div>
            )}

            {member.photo_path ? (
              <a 
                href={member.photo_path} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ display: 'inline-block', width: '100%', textAlign: 'center', background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px', fontSize: '0.9rem' }}
              >
                여권 사본 원본 보기 📸
              </a>
            ) : (
              <div style={{ textAlign: 'center', color: '#ef4444', fontSize: '0.9rem', padding: '10px' }}>여권 사본 미제출</div>
            )}
          </div>
        ))}
        {members.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', gridColumn: '1 / -1' }}>
            아직 정보를 제출한 멤버가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}

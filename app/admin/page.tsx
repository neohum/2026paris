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

type AdminChecklist = {
  id: number;
  label: string;
  description: string;
  is_provided_by_admin: boolean;
};

export default function AdminPage() {
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [adminChecklists, setAdminChecklists] = useState<AdminChecklist[]>([]);
  const [loading, setLoading] = useState(true);

  // 체크리스트 폼 상태
  const [newLabel, setNewLabel] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isProvided, setIsProvided] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/admin/members');
        if (res.ok) {
          const data = await res.json();
          setMembers(data);
        } else {
          window.location.href = '/dashboard';
          return;
        }

        const clRes = await fetch('/api/admin/checklists');
        if (clRes.ok) {
          const clData = await clRes.json();
          setAdminChecklists(clData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleAddChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return alert('항목 이름을 입력해주세요.');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/checklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newLabel, description: newDesc, is_provided_by_admin: isProvided })
      });
      if (res.ok) {
        const { item } = await res.json();
        setAdminChecklists([...adminChecklists, item]);
        setNewLabel('');
        setNewDesc('');
        setIsProvided(false);
      } else {
        const err = await res.json();
        alert(err.error || '항목 추가 실패');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteChecklist = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까? 전체 멤버의 체크리스트 항목에서도 즉각 사라집니다.')) return;
    try {
      const res = await fetch(`/api/admin/checklists/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAdminChecklists(adminChecklists.filter(c => c.id !== id));
      } else {
        alert('삭제 실패');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>로딩 중...</div>;

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <h1 className="page-title" style={{ color: '#10b981' }}>👑 관리자(Admin) 컨트롤 센터</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        서버 전체 설정 관리 및 멤버 제출 정보 통합 관리 화면입니다.
      </p>

      {/* ─────────────────────────────────────────────────────────────
          1. 공통 준비물 (Checklist) 통제 섹션
          ───────────────────────────────────────────────────────────── */}
      <h2 style={{ fontSize: '1.4rem', borderBottom: '2px solid rgba(16, 185, 129, 0.4)', paddingBottom: '0.5rem', marginBottom: '1.5rem', marginTop: '3rem' }}>
        🎒 전체 멤버 공용/필수 준비물 배포 관리
      </h2>
      <div className="glass" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', fontSize: '1.2rem' }}>배포된 항목 리스트</h3>
        {adminChecklists.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>현재 배포된 관리자 공용 준비물이 없습니다.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {adminChecklists.map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: c.is_provided_by_admin ? '4px solid #10b981' : '4px solid #f59e0b' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    {c.is_provided_by_admin ? (
                       <span style={{ fontSize: '0.8rem', background: '#10b981', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>관리자 공용 배치</span>
                    ) : (
                       <span style={{ fontSize: '0.8rem', background: '#f59e0b', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>팀원 강제 지시</span>
                    )}
                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{c.label}</h4>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{c.description}</p>
                </div>
                <button onClick={() => handleDeleteChecklist(c.id)} style={{ background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#ef4444', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>
                  철회(삭제)
                </button>
              </div>
            ))}
          </div>
        )}

        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', fontSize: '1.2rem', marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>새 항목 전체 멤버에게 배포하기</h3>
        <form onSubmit={handleAddChecklist} style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input 
              type="checkbox" 
              id="isProvidedCheck"
              checked={isProvided}
              onChange={(e) => setIsProvided(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: '#10b981' }}
            />
            <label htmlFor="isProvidedCheck" style={{ cursor: 'pointer', fontSize: '1rem' }}>
              <strong>[관리자 짐가방 품목]</strong> 관리자가 대표로 챙겨가는 공용비품인가요?<br/>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>체크 시, 유저 화면에서 "챙김 완료"로 자동 표시되어 유저가 짐을 안 싸도 됩니다. 미체크 시 개별적으로 꼭 싸야하는 지시사항이 됩니다.</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="배포 항목 이름 (예: 구급 상자 / 대형 멀티탭 / 모임용 드레스코드 등)" 
              value={newLabel} 
              onChange={e => setNewLabel(e.target.value)} 
              required
              style={{ flex: '1 1 300px', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }}
            />
          </div>

          <input 
            type="text" 
            placeholder="항목 부연 설명 (선택사항)" 
            value={newDesc} 
            onChange={e => setNewDesc(e.target.value)} 
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none' }}
          />
          <button type="submit" disabled={isSubmitting} style={{ background: '#10b981', color: 'white', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
            {isSubmitting ? '배포 처리 중...' : '전체 체크리스트에 즉시 반영하기'}
          </button>
        </form>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. 여권 및 정보 제출 리스트
          ───────────────────────────────────────────────────────────── */}
      <h2 style={{ fontSize: '1.4rem', borderBottom: '2px solid rgba(16, 185, 129, 0.4)', paddingBottom: '0.5rem', marginBottom: '1.5rem', marginTop: '3rem' }}>
        🎫 멤버 전체 여권/비상 정보 관리
      </h2>
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

'use client';

import { useState, useEffect } from 'react';
import './paris.css';

interface VoteStats {
  [key: number]: number;
}

export default function GeneralPollingPage() {
  // 파리 시내 투표 상태
  const [counts, setCounts] = useState<VoteStats>({ 1: 0, 2: 0, 3: 0 });
  const [myVote, setMyVote] = useState<number | null>(null);
  
  // 렌터카 코스 투표 상태
  const [courseCounts, setCourseCounts] = useState<VoteStats>({ 1: 0, 2: 0, 3: 0 });
  const [myCourseVote, setMyCourseVote] = useState<number | null>(null);
  const [courses, setCourses] = useState<any[]>([]);

  // 아코디언 상태
  const [expandedParis, setExpandedParis] = useState<Record<number, boolean>>({});
  const [expandedCourse, setExpandedCourse] = useState<Record<number, boolean>>({});

  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 파리 투표 가져오기
      fetch('/api/paris-vote').then(res => res.json()).then(data => {
        if (data.counts) setCounts(data.counts);
        if (data.currentVote) setMyVote(data.currentVote);
      });

      // 렌터카 투표 가져오기
      fetch('/api/course-vote').then(res => res.json()).then(data => {
        if (data.counts) setCourseCounts(data.counts);
        if (data.currentVote) setMyCourseVote(data.currentVote);
      });

      // 코스 정보 가져오기
      fetch('/api/courses').then(res => res.json()).then(data => {
        if (Array.isArray(data)) setCourses(data);
      });

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleParis = (id: number) => {
    setExpandedParis(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCourse = (id: number) => {
    setExpandedCourse(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // 파리 투표 핸들러
  const handleVote = async (optionId: number) => {
    setLoading(true);
    try {
      const res = await fetch('/api/paris-vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId })
      });
      if (res.ok) {
        fetch('/api/paris-vote').then(r => r.json()).then(d => {
          if (d.counts) setCounts(d.counts);
          if (d.currentVote) setMyVote(d.currentVote);
        });
      } else {
        const data = await res.json();
        alert(data.error || '투표에 실패했습니다.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 렌터카 투표 핸들러
  const handleCourseVote = async (courseId: number) => {
    setLoading(true);
    try {
      const res = await fetch('/api/course-vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId })
      });
      if (res.ok) {
        fetch('/api/course-vote').then(r => r.json()).then(d => {
          if (d.counts) setCourseCounts(d.counts);
          if (d.currentVote) setMyCourseVote(d.currentVote);
        });
      } else {
        const data = await res.json();
        alert(data.error || '투표에 실패했습니다.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 백분율 계산 유틸
  const totalVotes = Object.values(counts).reduce((a, b) => a + b, 0);
  const getPercentage = (optionId: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((counts[optionId] / totalVotes) * 100);
  };

  const totalCourseVotes = Object.values(courseCounts).reduce((a, b) => a + b, 0);
  const getCoursePercentage = (courseId: number) => {
    if (totalCourseVotes === 0) return 0;
    const count = courseCounts[courseId] || 0;
    return Math.round((count / totalCourseVotes) * 100);
  };

  return (
    <div className="paris-container">
      <h1 className="page-title">🇫🇷 전체 투어 일정 설문조사</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>여행 파티원들의 취향을 수합하여 전체 일정을 확정합니다.</p>

      {/* ─────────────────────────────────────────────────────────────
          섹션 1: 파리 시내 일정 투표 
          ───────────────────────────────────────────────────────────── */}
      <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1.5rem', borderRadius: '16px', marginBottom: '3rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>🗼 [PART 1] 파리 시내 투어 옵션</h2>

        <div className="info-panel glass">
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1.2rem' }}>💡 팁: 루브르와 오르세를 다른 날로 나눈 이유는?</h3>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', lineHeight: '1.8', fontSize: '1rem' }}>
            <li><strong>박물관 피로 (Museum Fatigue):</strong> 엄청난 규모의 루브르 관람만으로도 하루 평균 1만 보 이상 걷습니다. 연달아 미술관을 가면 체력 고갈로 감동이 반감됩니다.</li>
            <li><strong>동선 분산과 힐링 배분:</strong> 무거운 관람은 오전으로 빼고, 오후는 유람선이나 산책 등 가벼운 일정과 혼합해야 일상에 무리가 없습니다.</li>
          </ul>
        </div>

        {/* 옵션 1 */}
        <div className={`paris-card glass ${myVote === 1 ? 'voted' : ''}`}>
          <div className="option-title">
            <h3 
              onClick={() => toggleParis(1)} 
              style={{ fontSize: '1.3rem', color: myVote === 1 ? '#10b981' : 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', userSelect: 'none' }}
            >
              옵션 A: 미술관 & 낭만 힐링 (여유)
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', transition: 'transform 0.2s', transform: expandedParis[1] ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
            </h3>
            <button className={`vote-btn ${myVote === 1 ? 'active' : ''}`} onClick={() => handleVote(1)} disabled={loading}>
              {myVote === 1 ? '✅ 투표 완료' : '이 코스로 투표'}
            </button>
          </div>
          {expandedParis[1] && (
            <ul className="day-list" style={{ marginTop: '1rem' }}>
              <li><span className="day-label">1일차</span> 루브르 박물관 (오전 집중) → 튈르리 정원 산책 → 센강 바토무슈(유람선) 야경</li>
              <li><span className="day-label">2일차</span> 오르세 미술관 → 몽마르뜨 언덕 산책 → 마르스 광장(에펠탑 피크닉)</li>
            </ul>
          )}
          <div className="gauge-bar-wrapper">
            <div className="gauge-bar" style={{ width: `${getPercentage(1)}%`, background: myVote === 1 ? '#10b981' : 'var(--primary)' }}>
              {getPercentage(1)}% ({counts[1]}표)
            </div>
          </div>
        </div>

        {/* 옵션 2 */}
        <div className={`paris-card glass ${myVote === 2 ? 'voted' : ''}`}>
          <div className="option-title">
            <h3 
              onClick={() => toggleParis(2)} 
              style={{ fontSize: '1.3rem', color: myVote === 2 ? '#10b981' : 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', userSelect: 'none' }}
            >
              옵션 B: 핵심 랜드마크 인증샷 (압축)
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', transition: 'transform 0.2s', transform: expandedParis[2] ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
            </h3>
            <button className={`vote-btn ${myVote === 2 ? 'active' : ''}`} onClick={() => handleVote(2)} disabled={loading}>
              {myVote === 2 ? '✅ 투표 완료' : '이 코스로 투표'}
            </button>
          </div>
          {expandedParis[2] && (
            <ul className="day-list" style={{ marginTop: '1rem' }}>
              <li><span className="day-label">1일차</span> 에펠탑(가까이서 관람) → 샹젤리제 거리 쇼핑 → 개선문 전망대 → 루브르(야경/외관 위주)</li>
              <li><span className="day-label">2일차</span> 오르세 미술관(오전 빠르게 관람) → 마레 지구 골목 탐방 → 센 강변 디너</li>
            </ul>
          )}
          <div className="gauge-bar-wrapper">
            <div className="gauge-bar" style={{ width: `${getPercentage(2)}%`, background: myVote === 2 ? '#10b981' : 'var(--primary)' }}>
              {getPercentage(2)}% ({counts[2]}표)
            </div>
          </div>
        </div>

        {/* 옵션 3 */}
        <div className={`paris-card glass ${myVote === 3 ? 'voted' : ''}`}>
          <div className="option-title">
            <h3 
              onClick={() => toggleParis(3)} 
              style={{ fontSize: '1.3rem', color: myVote === 3 ? '#10b981' : 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', userSelect: 'none' }}
            >
              옵션 C: 로컬 미식 & 쇼핑 집중 (트렌디)
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', transition: 'transform 0.2s', transform: expandedParis[3] ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
            </h3>
            <button className={`vote-btn ${myVote === 3 ? 'active' : ''}`} onClick={() => handleVote(3)} disabled={loading}>
              {myVote === 3 ? '✅ 투표 완료' : '이 코스로 투표'}
            </button>
          </div>
          {expandedParis[3] && (
            <ul className="day-list" style={{ marginTop: '1rem' }}>
              <li><span className="day-label">1일차</span> 오르세 미술관(가이드 투어) → 파리 갤러리 라파예트 백화점 주변 쇼핑 → 마레지구 저녁 다이닝</li>
              <li><span className="day-label">2일차</span> 루브르 박물관 오전 관람 → 피카소 미술관 주변 로컬 카페 → 몽마르뜨 언덕 일몰 산책</li>
            </ul>
          )}
          <div className="gauge-bar-wrapper">
            <div className="gauge-bar" style={{ width: `${getPercentage(3)}%`, background: myVote === 3 ? '#10b981' : 'var(--primary)' }}>
              {getPercentage(3)}% ({counts[3]}표)
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          섹션 2: 렌터카 투어 투표
          ───────────────────────────────────────────────────────────── */}
      <div style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>🚗 [PART 2] 프랑스 근교 렌터카 코스 투표</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          자세한 동선 및 목적지 정보는 <a href="/map" style={{color: '#f59e0b', textDecoration: 'underline'}}>지도 & 일정</a> 메뉴에서 확인하신 후 투표해 주세요.
        </p>

        {courses.length === 0 && <div style={{ padding: '2rem', textAlign: 'center' }}>코스 정보를 불러오는 중입니다...</div>}
        
        {courses.map(course => {
          const isVoted = myCourseVote === course.id;
          const themeColor = course.color || '#f59e0b';
          
          return (
            <div key={course.id} className={`paris-card glass ${isVoted ? 'voted' : ''}`} style={isVoted ? { borderColor: '#10b981' } : {}}>
              <div className="option-title">
                <h3 
                  onClick={() => toggleCourse(course.id)}
                  style={{ fontSize: '1.3rem', color: isVoted ? '#10b981' : themeColor, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', userSelect: 'none' }}
                >
                  {course.name}
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', transition: 'transform 0.2s', transform: expandedCourse[course.id] ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                </h3>
                <button 
                  className={`vote-btn ${isVoted ? 'active' : ''}`} 
                  onClick={() => handleCourseVote(course.id)} 
                  disabled={loading}
                  style={!isVoted ? { background: themeColor } : {}}
                >
                  {isVoted ? '✅ 투표 완료' : '이 코스로 투표'}
                </button>
              </div>
              
              {expandedCourse[course.id] && (
                <div style={{ marginTop: '1rem', marginBottom: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
                  <h4 style={{ fontSize: '0.95rem', color: themeColor, marginBottom: '0.5rem' }}>전체 방문 일정:</h4>
                  <ul className="day-list">
                    {course.places.map((p:any) => (
                      <li key={p.id}>
                        <span className="day-label" style={{ background: themeColor }}>Day {p.day_number}</span> 
                        <strong>{p.name}</strong> 
                        <br/>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>{p.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="gauge-bar-wrapper">
                <div className="gauge-bar" style={{ width: `${getCoursePercentage(course.id)}%`, background: isVoted ? '#10b981' : themeColor }}>
                  {getCoursePercentage(course.id)}% ({(courseCounts[course.id] || 0)}표)
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

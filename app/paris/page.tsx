'use client';

import { useState, useEffect } from 'react';
import './paris.css';

interface VoteStats {
  [key: number]: number;
}

export default function GeneralPollingPage() {
  const [counts, setCounts] = useState<VoteStats>({ 1: 0, 2: 0, 3: 0 });
  const [myVote, setMyVote] = useState<number | null>(null);
  
  const [courseCounts, setCourseCounts] = useState<VoteStats>({ 1: 0, 2: 0, 3: 0 });
  const [myCourseVote, setMyCourseVote] = useState<number | null>(null);
  const [courses, setCourses] = useState<any[]>([]);

  const [expandedParis, setExpandedParis] = useState<Record<number, boolean>>({});
  const [expandedCourse, setExpandedCourse] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      fetch('/api/paris-vote').then(res => res.json()).then(data => {
        if (data.counts) setCounts(data.counts);
        if (data.currentVote) setMyVote(data.currentVote);
      });

      fetch('/api/course-vote').then(res => res.json()).then(data => {
        if (data.counts) setCourseCounts(data.counts);
        if (data.currentVote) setMyCourseVote(data.currentVote);
      });

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

  const toggleParis = (id: number) => setExpandedParis(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleCourse = (id: number) => setExpandedCourse(prev => ({ ...prev, [id]: !prev[id] }));

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
      <h1 className="page-title">전체 일정 투표</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.6' }}>여행 파티원들의 취향을 수합하여 파리 및 렌터카 전체 일정을 조율합니다.</p>

      {/* 파리 시내 일정 투표 */}
      <div style={{ padding: '2rem 1.5rem', borderRadius: '16px', marginBottom: '3rem', border: '1px solid var(--border-color)', background: '#fff' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', color: 'var(--secondary)', fontFamily: "'Cormorant Garamond', serif" }}>[PART 1] 파리 시내 일정</h2>

        <div className="info-panel">
          <h2 style={{ fontSize: '1.15rem', marginBottom: '0.8rem' }}>💡 팁: 루브르와 오르세를 다른 날로 나눈 이유</h2>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', lineHeight: '1.6', fontSize: '0.95rem', color: 'var(--text-main)' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>박물관 피로:</strong> 엄청난 규모의 루브르 관람만으로도 하루 평균 1만 보 이상 걷습니다. 연달아 미술관을 가면 체력 고갈로 감동이 반감됩니다.</li>
            <li><strong>동선 분산:</strong> 무거운 관람은 오전으로 빼고, 오후는 유람선이나 산책 등 가벼운 일정과 혼합해야 무리가 없습니다.</li>
          </ul>
        </div>

        {/* 옵션 1 */}
        <div className="paris-grid">
        <div className={`paris-card ${myVote === 1 ? 'voted' : ''}`}>
          <div className="option-title">
            <h2 onClick={() => toggleParis(1)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', userSelect: 'none' }}>
              옵션 A: 미술관 & 낭만 힐링
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', transition: 'transform 0.2s', transform: expandedParis[1] ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
            </h2>
            <button className={`vote-btn ${myVote === 1 ? 'active' : ''}`} onClick={() => handleVote(1)} disabled={loading}>
              {myVote === 1 ? '투표 완료' : '선택하기'}
            </button>
          </div>
          {expandedParis[1] && (
            <ul className="day-list" style={{ marginTop: '1rem' }}>
              <li><span className="day-label">1일차</span> 루브르 박물관 (오전 집중) → 튈르리 정원 산책 → 센강 바토무슈(유람선) 야경</li>
              <li><span className="day-label">2일차</span> 오르세 미술관 → 몽마르뜨 언덕 산책 → 마르스 광장(에펠탑 피크닉)</li>
            </ul>
          )}
          <div className="gauge-bar-wrapper">
            <div className="gauge-bar" style={{ width: `${getPercentage(1)}%` }}>
              {getPercentage(1)}%
            </div>
          </div>
        </div>

        {/* 옵션 2 */}
        <div className={`paris-card ${myVote === 2 ? 'voted' : ''}`}>
          <div className="option-title">
            <h2 onClick={() => toggleParis(2)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', userSelect: 'none' }}>
              옵션 B: 핵심 랜드마크 압축
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', transition: 'transform 0.2s', transform: expandedParis[2] ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
            </h2>
            <button className={`vote-btn ${myVote === 2 ? 'active' : ''}`} onClick={() => handleVote(2)} disabled={loading}>
              {myVote === 2 ? '투표 완료' : '선택하기'}
            </button>
          </div>
          {expandedParis[2] && (
            <ul className="day-list" style={{ marginTop: '1rem' }}>
              <li><span className="day-label">1일차</span> 에펠탑(가까이서 관람) → 샹젤리제 거리 쇼핑 → 개선문 전망대 → 루브르(야경/외관 위주)</li>
              <li><span className="day-label">2일차</span> 오르세 미술관(오전 빠르게 관람) → 마레 지구 골목 탐방 → 센 강변 디너</li>
            </ul>
          )}
          <div className="gauge-bar-wrapper">
            <div className="gauge-bar" style={{ width: `${getPercentage(2)}%` }}>
              {getPercentage(2)}%
            </div>
          </div>
        </div>

        {/* 옵션 3 */}
        <div className={`paris-card ${myVote === 3 ? 'voted' : ''}`}>
          <div className="option-title">
            <h2 onClick={() => toggleParis(3)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', userSelect: 'none' }}>
              옵션 C: 미식 & 쇼핑 집중
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', transition: 'transform 0.2s', transform: expandedParis[3] ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
            </h2>
            <button className={`vote-btn ${myVote === 3 ? 'active' : ''}`} onClick={() => handleVote(3)} disabled={loading}>
              {myVote === 3 ? '투표 완료' : '선택하기'}
            </button>
          </div>
          {expandedParis[3] && (
            <ul className="day-list" style={{ marginTop: '1rem' }}>
              <li><span className="day-label">1일차</span> 오르세 가이드 투어 → 라파예트 백화점 주변 쇼핑 → 마레지구 다이닝</li>
              <li><span className="day-label">2일차</span> 루브르 박물관 오전 관람 → 피카소 미술관 주변 로컬 카페 → 몽마르뜨 언덕 일몰</li>
            </ul>
          )}
          <div className="gauge-bar-wrapper">
            <div className="gauge-bar" style={{ width: `${getPercentage(3)}%` }}>
              {getPercentage(3)}%
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* 렌터카 일주 투표 */}
      <div style={{ padding: '2rem 1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', background: '#fff' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--secondary)', fontFamily: "'Cormorant Garamond', serif" }}>[PART 2] 프랑스 근교 렌터카 코스</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>자세한 동선은 일정 탭의 <a href="/map" style={{ color: 'var(--secondary)', textDecoration: 'underline' }}>지도</a>에서 확인하신 후 투표해 주세요.</p>

        {courses.length === 0 && <div style={{ padding: '2rem', textAlign: 'center' }}>코스 로딩 중...</div>}
        
        <div className="paris-grid">
        {courses.map(course => {
          const isVoted = myCourseVote === course.id;
          
          return (
            <div key={course.id} className={`paris-card ${isVoted ? 'voted' : ''}`}>
              <div className="option-title">
                <h2 
                  onClick={() => toggleCourse(course.id)}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', userSelect: 'none' }}
                >
                  {course.name}
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', transition: 'transform 0.2s', transform: expandedCourse[course.id] ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                </h2>
                <button className={`vote-btn ${isVoted ? 'active' : ''}`} onClick={() => handleCourseVote(course.id)} disabled={loading}>
                  {isVoted ? '투표 완료' : '선택하기'}
                </button>
              </div>
              
              {expandedCourse[course.id] && (
                <div style={{ marginTop: '1rem', marginBottom: '1rem', background: 'var(--bg-light)', padding: '1rem', borderRadius: '12px' }}>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--secondary)', marginBottom: '0.8rem' }}>전체 방문 일정:</h4>
                  <ul className="day-list">
                    {course.places.map((p:any) => (
                      <li key={p.id}>
                        <span className="day-label">Day {p.day_number}</span> 
                        <strong style={{ color: 'var(--text-main)' }}>{p.name}</strong> 
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>{p.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="gauge-bar-wrapper">
                <div className="gauge-bar" style={{ width: `${getCoursePercentage(course.id)}%` }}>
                  {getCoursePercentage(course.id)}%
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>

    </div>
  );
}

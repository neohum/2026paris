'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// SSR 방지 (Leaflet은 브라우저의 window 객체가 필요함)
const MapView = dynamic(() => import('@/components/MapView'), { 
  ssr: false,
  loading: () => <div style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>지도 불러오는 중...</div>
});

type Course = {
  id: number;
  name: string;
  color: string;
  places: any[];
};

export default function MapPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourseId, setActiveCourseId] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch('/api/courses');
        const data = await res.json();
        if (Array.isArray(data)) {
          setCourses(data);
          if (data.length > 0) setActiveCourseId(data[0].id);
        }
      } catch (error) {
        console.error('코스 가져오기 실패:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  const activeCourse = courses.find(c => c.id === activeCourseId);

  if (loading) return <div className="text-center mt-5">로딩 중...</div>;

  return (
    <div>
      <h1 className="page-title">🗺️ 지도 & 일정</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>원하는 코스를 선택하여 상세 일정을 확인하세요.</p>

      {/* 코스 선택 탭 */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {courses.map(course => (
          <button
            key={course.id}
            onClick={() => setActiveCourseId(course.id)}
            style={{
              backgroundColor: activeCourseId === course.id ? course.color : 'transparent',
              color: activeCourseId === course.id ? '#fff' : 'var(--text-main)',
              border: `2px solid ${activeCourseId === course.id ? 'transparent' : 'rgba(255,255,255,0.2)'}`,
              padding: '10px 20px',
              borderRadius: '25px'
            }}
          >
            {course.name}
          </button>
        ))}
      </div>

      {/* 지도 영역 */}
      <div className="glass" style={{ padding: '10px' }}>
        {activeCourse ? (
          <MapView course={activeCourse} />
        ) : (
          <div style={{ padding: '20px', textAlign: 'center' }}>코스가 없습니다.</div>
        )}
      </div>

      {/* 노선 간략 리스트업 */}
      {activeCourse && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: activeCourse.color }}>{activeCourse.name} 상세 일정</h2>
          <div className="glass" style={{ padding: '2rem' }}>
            {activeCourse.places.map((place, idx) => (
              <div key={place.id} style={{ display: 'flex', marginBottom: '1.5rem', borderBottom: idx !== activeCourse.places.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none', paddingBottom: '1.5rem' }}>
                <div style={{ width: '80px', fontWeight: 'bold', color: 'var(--primary)', flexShrink: 0 }}>
                  Day {place.day_number}
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{place.name}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{new Date(place.visit_date).toLocaleDateString()}</p>
                  <p style={{ fontSize: '0.95rem' }}>{place.description} ({place.activities})</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

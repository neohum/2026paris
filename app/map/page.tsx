'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/MapView'), { 
  ssr: false,
  loading: () => <div style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>지도 불러오는 중...</div>
});

type Place = {
  id: number;
  name: string;
  description: string;
  lat: number;
  lng: number;
  visit_date: string;
  day_number: number;
  activities: string;
  place_type?: string;
};

type Course = {
  id: number;
  name: string;
  color: string;
  places: Place[];
};

const getRecommendation = (placeName: string) => {
  if (placeName.includes('파리') || placeName.includes('샤를 드골') || placeName.includes('CDG')) return { visit: '14:00 - 16:00', duration: '약 2~3시간' };
  if (placeName.includes('루앙')) return { visit: '10:00 - 13:00', duration: '약 3시간' };
  if (placeName.includes('옹플뢰르')) return { visit: '14:30 - 17:00', duration: '약 2시간 30분' };
  if (placeName.includes('몽생미셸')) return { visit: '16:00 - 21:00', duration: '약 5시간 (★일몰/야경 필수)' };
  if (placeName.includes('에트르타')) return { visit: '10:00 - 12:30', duration: '약 2시간 30분' };
  if (placeName.includes('샹보르')) return { visit: '09:30 - 12:30', duration: '약 3시간' };
  if (placeName.includes('쉬농소')) return { visit: '14:00 - 16:30', duration: '약 2시간 30분' };
  return { visit: '오전/오후 중 탄력 배분', duration: '약 2시간' };
};

export default function MapPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourseId, setActiveCourseId] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  // 새 일정(숙소/추천) 추가 상태
  const [isAddingPlace, setIsAddingPlace] = useState(false);
  const [newLocation, setNewLocation] = useState<{lat: number, lng: number} | null>(null);
  const [placeName, setPlaceName] = useState('');
  const [placeDesc, setPlaceDesc] = useState('');
  const [placeType, setPlaceType] = useState('accommodation'); // accommodation | recommended
  const [dayNumber, setDayNumber] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 주소 또는 좌표 직접 입력 상태
  const [locationInput, setLocationInput] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (Array.isArray(data)) {
        setCourses(data);
        if (activeCourseId === 0 && data.length > 0) setActiveCourseId(data[0].id);
      }
    } catch (error) {
      console.error('코스 가져오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const activeCourse = courses.find(c => c.id === activeCourseId);

  const handleMapClick = (lat: number, lng: number) => {
    if (isAddingPlace) {
      setNewLocation({ lat, lng });
      setLocationInput(`${lat.toFixed(5)}, ${lng.toFixed(5)}`); // 지도 클릭 시 입력창도 자동으로 업데이트
    }
  };

  const handleParseLocation = async () => {
    if (!locationInput.trim()) return;
    setIsResolving(true);
    try {
      // 1. 단순 위도, 경도 패턴 비교
      const coordMatch = locationInput.match(/^(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)$/);
      if (coordMatch) {
        setNewLocation({ lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) });
        setIsResolving(false);
        return;
      }

      // 2. 구글 지도 긴 URL 내에서 파싱
      const urlMatch = locationInput.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || locationInput.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
      if (urlMatch) {
        setNewLocation({ lat: parseFloat(urlMatch[1]), lng: parseFloat(urlMatch[2]) });
        setIsResolving(false);
        return;
      }

      // 3. goo.gl / 구글맵 공유 링크일 경우 백엔드로 해독 요청
      if (locationInput.includes('http')) {
        const res = await fetch('/api/resolve-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: locationInput.trim() })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.lat && data.lng) {
            setNewLocation({ lat: data.lat, lng: data.lng });
            setIsResolving(false);
            return;
          }
        }
      }

      alert("입력하신 주소나 좌표 형식을 식별할 수 없습니다. 구글 지도 공유 주소나 정확한 숫자를 입력해 주세요.");
    } catch (error) {
      console.error(error);
      alert("좌표 분석 중 오류가 발생했습니다.");
    } finally {
      setIsResolving(false);
    }
  };

  const handleAddPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation) return alert("지도에서 추가할 위치를 마우스로 먼저 클릭해주세요!");
    if (!placeName.trim()) return alert("자유 일정의 장소(호텔/명소) 이름을 입력해주세요.");
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/courses/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: activeCourseId,
          name: placeName,
          description: placeDesc,
          lat: newLocation.lat,
          lng: newLocation.lng,
          placeType,
          dayNumber
        })
      });

      if (res.ok) {
        setIsAddingPlace(false);
        setNewLocation(null);
        setPlaceName('');
        setPlaceDesc('');
        await fetchCourses(); 
      } else {
        const error = await res.json();
        alert(error.error || "추가에 실패했습니다.");
      }
    } catch(err) {
      console.error(err);
      alert("네트워크 오류 발생");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && courses.length === 0) return <div className="text-center mt-5">로딩 중...</div>;

  return (
    <div>
      <h1 className="page-title">🗺️ 지도 & 일정</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>기본 코스를 확인하고 숙소나 추천 일정을 자유롭게 추가하세요.</p>

      {/* 코스 선택 탭 */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {courses.map(course => (
          <button
            key={course.id}
            onClick={() => {
              setActiveCourseId(course.id);
              setIsAddingPlace(false);
              setNewLocation(null);
              setLocationInput('');
            }}
            style={{
              backgroundColor: activeCourseId === course.id ? course.color : 'transparent',
              color: activeCourseId === course.id ? '#fff' : 'var(--text-main)',
              border: `2px solid ${activeCourseId === course.id ? 'transparent' : 'rgba(255,255,255,0.2)'}`,
              padding: '10px 20px',
              borderRadius: '25px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {course.name}
          </button>
        ))}
      </div>

      {/* 새 일정 추가 토글 버튼 */}
      {activeCourse && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={() => {
              setIsAddingPlace(!isAddingPlace);
              setNewLocation(null);
              setLocationInput('');
            }} 
            style={{ 
              background: isAddingPlace ? '#ef4444' : 'var(--primary)', 
              color: 'white', 
              border: 'none', 
              padding: '0.8rem 1.5rem', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
            }}
          >
            {isAddingPlace ? '✖ 추가 취소' : '➕ 숙소/추천장소 추가하기'}
          </button>
        </div>
      )}

      {/* 새 일정 폼 영역 */}
      {isAddingPlace && (
        <div className="glass" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--primary)', animation: 'fadeIn 0.3s' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--primary)' }}>1️⃣</span> 위치 정보 입력 (지도 클릭 또는 붙여넣기)
          </h3>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
            <input 
              type="text" 
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="구글지도 공유 링크(예: https://goo.gl/maps/...) 또는 `위도, 경도` 입력" 
              style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <button 
              type="button"
              onClick={handleParseLocation}
              disabled={isResolving}
              style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '0 1.5rem', borderRadius: '8px', cursor: isResolving ? 'wait' : 'pointer' }}
            >
              {isResolving ? '확인 중...' : '적용 (위치 찾기)'}
            </button>
          </div>

          {newLocation ? (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              ✅ 위치가 선택되었습니다! 이제 아래 폼을 작성해 주세요. (위도: {newLocation.lat.toFixed(4)}, 경도: {newLocation.lng.toFixed(4)})
            </div>
          ) : (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              ⏳ 아직 위치가 지정되지 않았습니다. 구글 지도 주소를 붙여넣거나, <strong>아래 지도에서 핀을 바로 클릭</strong>해 주세요.
            </div>
          )}

          <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--primary)' }}>2️⃣</span> 장소 정보 입력
          </h3>
          <form onSubmit={handleAddPlace} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>장소 구분</label>
                <select 
                  value={placeType} 
                  onChange={e => setPlaceType(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <option value="accommodation" style={{ color: 'black' }}>🏨 숙소 (Hotel/Airbnb)</option>
                  <option value="recommended" style={{ color: 'black' }}>🌟 유저 추천 장소 (Attraction)</option>
                </select>
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>장소 이름</label>
                <input 
                  type="text" 
                  value={placeName} 
                  onChange={e => setPlaceName(e.target.value)} 
                  placeholder="예: 이비스 에펠 타워" 
                  required
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              <div style={{ flex: '0 0 120px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>여행 일차(Day)</label>
                <input 
                  type="number" 
                  min="1" max="10"
                  value={dayNumber} 
                  onChange={e => setDayNumber(parseInt(e.target.value))} 
                  required
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>간단한 코멘트 (선택)</label>
              <input 
                type="text" 
                value={placeDesc} 
                onChange={e => setPlaceDesc(e.target.value)} 
                placeholder="예: 조각상이 예뻐서 넣었어요, 예약 마감 전 결제 예정" 
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={!newLocation || isSubmitting}
              style={{ 
                background: newLocation ? '#10b981' : 'rgba(255,255,255,0.1)', 
                color: 'white', 
                border: 'none', 
                padding: '1rem', 
                borderRadius: '8px', 
                fontWeight: 'bold',
                cursor: newLocation ? 'pointer' : 'not-allowed',
                marginTop: '0.5rem'
              }}
            >
              {isSubmitting ? '저장 중...' : '✔ 일정에 추가하기'}
            </button>
          </form>
        </div>
      )}

      {/* 지도 영역 */}
      <div className={`glass ${isAddingPlace ? 'pulse-border' : ''}`} style={{ padding: '10px', transition: 'border 0.3s' }}>
        {activeCourse ? (
          <MapView 
            course={activeCourse} 
            onMapClick={isAddingPlace ? handleMapClick : undefined}
            newLocation={newLocation}
          />
        ) : (
          <div style={{ padding: '20px', textAlign: 'center' }}>코스가 없습니다.</div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse-border {
          0% { border-color: rgba(239, 68, 68, 0.4); box-shadow: 0 0 0 rgba(239, 68, 68, 0.4); }
          50% { border-color: rgba(239, 68, 68, 1); box-shadow: 0 0 10px rgba(239, 68, 68, 0.8); }
          100% { border-color: rgba(239, 68, 68, 0.4); box-shadow: 0 0 0 rgba(239, 68, 68, 0.4); }
        }
        .pulse-border {
          animation: pulse-border 1.5s infinite;
        }
      `}</style>

      {/* 노선 간략 리스트업 */}
      {activeCourse && (
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: activeCourse.color, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '12px', height: '12px', background: activeCourse.color, borderRadius: '50%', display: 'inline-block' }}></span>
            {activeCourse.name} 전체 일정표
          </h2>
          <div className="glass" style={{ padding: '2rem' }}>
            {activeCourse.places.map((place, idx) => {
              const rec = getRecommendation(place.name);
              
              // place type style overrides
              const isAcc = place.place_type === 'accommodation';
              const isRec = place.place_type === 'recommended';
              const isDefault = !place.place_type || place.place_type === 'attraction';

              return (
              <div key={place.id} style={{ display: 'flex', marginBottom: '1.5rem', borderBottom: idx !== activeCourse.places.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none', paddingBottom: '1.5rem' }}>
                <div style={{ width: '80px', fontWeight: 'bold', color: isAcc ? '#10b981' : (isRec ? '#f59e0b' : 'var(--primary)'), flexShrink: 0 }}>
                  Day {place.day_number}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem' }}>
                    {isAcc && <span style={{ background: '#10b981', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>🏨 숙소</span>}
                    {isRec && <span style={{ background: '#f59e0b', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>⭐ 자유일정</span>}
                    {isDefault && <span style={{ background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>공식 일정</span>}
                    <h4 style={{ fontSize: '1.15rem', margin: 0 }}>{place.name}</h4>
                  </div>
                  
                  {place.visit_date && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{new Date(place.visit_date).toLocaleDateString()}</p>}
                  
                  {isDefault && (
                    <div style={{ display: 'inline-block', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      🕒 {rec.visit} &nbsp;|&nbsp; ⏳ {rec.duration}
                    </div>
                  )}

                  <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginTop: '0.5rem' }}>{place.description}</p>
                  
                  {place.activities && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}><strong>활동:</strong> {place.activities}</p>
                  )}
                </div>
              </div>
            )})}
            {activeCourse.places.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>등록된 일정이 없습니다.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

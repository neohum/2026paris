'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/MapView'), { 
  ssr: false,
  loading: () => <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>지도 불러오는 중...</div>
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
  if (placeName.includes('몽생미셸')) return { visit: '16:00 - 21:00', duration: '약 5시간 (일몰/야경 필수)' };
  if (placeName.includes('에트르타')) return { visit: '10:00 - 12:30', duration: '약 2시간 30분' };
  if (placeName.includes('샹보르')) return { visit: '09:30 - 12:30', duration: '약 3시간' };
  if (placeName.includes('쉬농소')) return { visit: '14:00 - 16:30', duration: '약 2시간 30분' };
  return { visit: '오전/오후 중 탄력 배분', duration: '약 2시간' };
};

export default function MapPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourseId, setActiveCourseId] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  const [isAddingPlace, setIsAddingPlace] = useState(false);
  const [newLocation, setNewLocation] = useState<{lat: number, lng: number} | null>(null);
  const [placeName, setPlaceName] = useState('');
  const [placeDesc, setPlaceDesc] = useState('');
  const [placeType, setPlaceType] = useState('accommodation'); 
  const [dayNumber, setDayNumber] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setLocationInput(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    }
  };

  const handleParseLocation = async () => {
    if (!locationInput.trim()) return;
    setIsResolving(true);
    try {
      const coordMatch = locationInput.match(/^(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)$/);
      if (coordMatch) {
        setNewLocation({ lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) });
        setIsResolving(false);
        return;
      }

      const urlMatch = locationInput.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || locationInput.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
      if (urlMatch) {
        setNewLocation({ lat: parseFloat(urlMatch[1]), lng: parseFloat(urlMatch[2]) });
        setIsResolving(false);
        return;
      }

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
      alert("입력하신 주소를 식별할 수 없습니다. 구글 지도 공유 주소나 좌표를 입력해 주세요.");
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

  if (loading && courses.length === 0) return <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-muted)' }}>로딩 중...</div>;

  return (
    <div>
      <h1 className="page-title">🗺️ 일정 계획 및 코스</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.6 }}>기본 코스를 확인하고 나만의 숙소나 추천 일정을 자유롭게 추가하세요.</p>

      {/* 코스 선택 탭 */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
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
              backgroundColor: activeCourseId === course.id ? 'var(--secondary)' : 'var(--bg-card)',
              color: activeCourseId === course.id ? '#fff' : 'var(--text-main)',
              border: `1px solid ${activeCourseId === course.id ? 'var(--secondary)' : 'var(--border-color)'}`,
              padding: '8px 16px',
              borderRadius: '99px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '0.9rem',
              fontWeight: 500
            }}
          >
            {course.name}
          </button>
        ))}
      </div>

      {activeCourse && (
        <div style={{ marginBottom: '1.5rem' }}>
          <button 
            onClick={() => {
              setIsAddingPlace(!isAddingPlace);
              setNewLocation(null);
              setLocationInput('');
            }} 
            className={isAddingPlace ? "btn-outline" : "btn-primary"}
            style={{ width: '100%', padding: '14px' }}
          >
            {isAddingPlace ? '✖ 취소' : '➕ 내가 찾은 숙소/명소 추가'}
          </button>
        </div>
      )}

      {/* 폼 영역 */}
      {isAddingPlace && (
        <div className="glass" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--primary)', animation: 'fadeIn 0.3s' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem' }}>
            <span style={{ color: 'var(--primary)' }}>1.</span> 위치 정보 입력
          </h3>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
            <input 
              type="text" 
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="구글지도 공유 링크 또는 좌표" 
              className="flight-input"
              style={{ margin: 0 }}
            />
            <button 
              type="button"
              onClick={handleParseLocation}
              disabled={isResolving}
              className="btn-primary"
            >
              적용
            </button>
          </div>

          {newLocation ? (
            <div style={{ background: '#fdfbf7', color: 'var(--text-main)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
              <span style={{ color: '#10b981', fontWeight: 600 }}>위치가 선택되었습니다!</span> <br/> 
              <span style={{ color: 'var(--text-muted)' }}>(위도: {newLocation.lat.toFixed(4)}, 경도: {newLocation.lng.toFixed(4)})</span>
            </div>
          ) : (
            <div style={{ background: '#fdfbf7', color: 'var(--text-main)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>위치를 지정해 주세요.</span> <br/>
              <span style={{ color: 'var(--text-muted)' }}>구글 지도를 붙여넣거나, 지도에서 직접 클릭하세요.</span>
            </div>
          )}

          <h3 style={{ marginBottom: '1rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem' }}>
            <span style={{ color: 'var(--primary)' }}>2.</span> 추가 정보 작성
          </h3>
          <form onSubmit={handleAddPlace} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>장소 구분</label>
              <select 
                value={placeType} 
                onChange={e => setPlaceType(e.target.value)}
                className="flight-input"
              >
                <option value="accommodation">🏨 숙소 (Hotel/Airbnb)</option>
                <option value="recommended">🌟 일정 (필수/선택 명소)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>장소 이름</label>
              <input 
                type="text" 
                value={placeName} 
                onChange={e => setPlaceName(e.target.value)} 
                placeholder="예: 이비스 에펠 타워" 
                required
                className="flight-input"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>일차(Day)</label>
              <input 
                type="number" 
                min="1" max="15"
                value={dayNumber} 
                onChange={e => setDayNumber(parseInt(e.target.value))} 
                required
                className="flight-input"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>코멘트 (선택)</label>
              <input 
                type="text" 
                value={placeDesc} 
                onChange={e => setPlaceDesc(e.target.value)} 
                placeholder="메모를 남겨주세요." 
                className="flight-input"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={!newLocation || isSubmitting}
              className="btn-primary"
              style={{ marginTop: '0.5rem' }}
            >
              {isSubmitting ? '저장 중...' : '✔ 저장하기'}
            </button>
          </form>
        </div>
      )}

      {/* 지도 영역 */}
      <div className={`glass ${isAddingPlace ? 'pulse-border' : ''}`} style={{ padding: '8px', transition: 'border 0.3s', marginBottom: '2rem' }}>
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
          0% { border-color: rgba(197, 160, 89, 0.4); box-shadow: 0 0 0 rgba(197, 160, 89, 0.4); }
          50% { border-color: rgba(197, 160, 89, 1); box-shadow: 0 0 10px rgba(197, 160, 89, 0.2); }
          100% { border-color: rgba(197, 160, 89, 0.4); box-shadow: 0 0 0 rgba(197, 160, 89, 0.4); }
        }
        .pulse-border {
          animation: pulse-border 1.5s infinite;
        }
      `}</style>

      {/* 타임라인 형식 리스트업 */}
      {activeCourse && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', color: 'var(--secondary)', fontFamily: "'Cormorant Garamond', serif" }}>
            세부 일정표: {activeCourse.name}
          </h2>
          <div className="glass" style={{ padding: '1.5rem 1rem' }}>
            {activeCourse.places.map((place, idx) => {
              const rec = getRecommendation(place.name);
              const isAcc = place.place_type === 'accommodation';
              const isRec = place.place_type === 'recommended';
              const isDefault = !place.place_type || place.place_type === 'attraction';

              return (
              <div key={place.id} style={{ display: 'flex', position: 'relative', paddingBottom: '2.5rem' }}>
                {idx !== activeCourse.places.length - 1 && (
                  <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: 0, width: '2px', background: 'var(--border-color)', zIndex: 0 }}></div>
                )}
                
                <div style={{ width: '24px', flexShrink: 0, zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: isAcc ? '#475569' : (isRec ? 'var(--primary)' : 'var(--secondary)'), border: '2px solid var(--bg-card)', marginTop: '4px' }}></div>
                </div>
                
                <div style={{ flex: 1, paddingLeft: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem', letterSpacing: '0.05em' }}>
                    DAY {place.day_number}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '1.15rem', margin: 0, color: 'var(--secondary)', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}
                      title="구글 지도에서 정보 보기"
                    >
                      {place.name} 🔗
                    </a>
                    {isAcc && <span className="badge" style={{ position: 'static', background: '#475569', padding: '2px 8px', fontSize: '0.7rem' }}>숙소</span>}
                    {isRec && <span className="badge" style={{ position: 'static', background: 'var(--primary)', padding: '2px 8px', fontSize: '0.7rem' }}>사용자 추천</span>}
                  </div>
                  
                  {place.visit_date && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{new Date(place.visit_date).toLocaleDateString()}</p>}
                  
                  {isDefault && (
                    <div style={{ display: 'inline-block', backgroundColor: 'var(--bg-light)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                      🕒 {rec.visit} &nbsp;|&nbsp; ⏳ {rec.duration}
                    </div>
                  )}

                  {place.description && (
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginTop: '0.5rem', lineHeight: 1.5 }}>
                      {place.description}
                    </p>
                  )}
                  
                  {place.activities && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', background: 'rgba(0,0,0,0.02)', padding: '8px', borderRadius: '6px' }}>
                      <strong style={{ color: 'var(--secondary)' }}>Activities:</strong> {place.activities}
                    </p>
                  )}
                </div>
              </div>
            )})}
            {activeCourse.places.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>등록된 일정이 없습니다.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

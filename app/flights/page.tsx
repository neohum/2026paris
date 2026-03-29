'use client';

import { useState, useEffect } from 'react';
import './flights.css';

type FlightOption = {
  id: string;
  type: string;
  airline: string;
  route: string;
  duration: string;
  price: string;
  features: string[];
  skyscannerUrl: string;
  isRecommended?: boolean;
};

export default function FlightsPage() {
  const [adults, setAdults] = useState(6);
  const [departureDate, setDepartureDate] = useState('260729'); 
  const [returnDate, setReturnDate] = useState('260812'); 

  const [userRecommendations, setUserRecommendations] = useState<any[]>([]);
  const [isAddingRec, setIsAddingRec] = useState(false);
  const [newRec, setNewRec] = useState({
    airline: '', route: '', departureDate: '', returnDate: '', price: '', duration: '', memo: ''
  });

  const loadRecommendations = async () => {
    try {
      const res = await fetch('/api/flights/recommend');
      if (res.ok) {
        const data = await res.json();
        setUserRecommendations(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const handleAddRec = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/flights/recommend', {
      method: 'POST',
      body: JSON.stringify(newRec),
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      setIsAddingRec(false);
      setNewRec({ airline: '', route: '', departureDate: '', returnDate: '', price: '', duration: '', memo: '' });
      loadRecommendations();
    } else {
      alert('추천 저장에 실패했습니다. (로그인 필요)');
    }
  }

  const handleVote = async (id: number) => {
    const res = await fetch('/api/flights/vote', {
      method: 'POST',
      body: JSON.stringify({ flightId: id }),
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      loadRecommendations();
    } else {
      alert('투표에 실패했습니다. (로그인 필요)');
    }
  }

  const flightOptions: FlightOption[] = [
    {
      id: 'opt1',
      type: '가장 빠르고 편리한 일정',
      airline: '대한항공 / 에어프랑스 (1회 경유)',
      route: 'PUS (김해) ↔ CDG (파리)',
      duration: '약 16시간 55분 소요',
      price: '약 13,240,000원',
      features: ['김해 ↔ 인천 내항기 연결로 수하물 연계 편리', '국적기 및 에어프랑스의 우수한 서비스', '경유 1회 중 체력 소모가 가장 적음'],
      skyscannerUrl: `https://www.skyscanner.co.kr/transport/flights/pus/cdg/${departureDate}/${returnDate}/?adultsv2=${adults}&cabinclass=economy&rtn=1`,
      isRecommended: true
    },
    {
      id: 'opt2',
      type: '김해 출발 비용 최우선 절감',
      airline: '에티하드 항공 등 외항사 (2회 경유)',
      route: 'PUS (김해) ↔ CDG (파리)',
      duration: '약 30시간 이상 소요',
      price: '약 12,170,000원',
      features: ['김해 출발 조건 중 가장 저렴한 가격대', '인천 및 중동(아부다비 등)에서 총 2회 환승 대기', '비행 및 대기 시간 대비 체력 소모가 클 수 있음'],
      skyscannerUrl: `https://www.skyscanner.co.kr/transport/flights/pus/cdg/${departureDate}/${returnDate}/?adultsv2=${adults}&cabinclass=economy&rtn=1`
    },
    {
      id: 'opt3',
      type: '유럽 거점 경유 옵션',
      airline: 'KLM / 핀에어 등 유럽 항공사',
      route: 'PUS (김해) ↔ CDG (파리)',
      duration: '약 18 ~ 20시간 소요',
      price: '약 13,500,000원',
      features: ['암스테르담, 헬싱키 등 유럽 주요 허브 1회 경유', '환승 게이트 동선 등이 유럽 내로 한정되어 편리', '스카이팀 등 다양한 마일리지 옵션 고려 대상'],
      skyscannerUrl: `https://www.skyscanner.co.kr/transport/flights/pus/cdg/${departureDate}/${returnDate}/?adultsv2=${adults}&cabinclass=economy&rtn=1`
    }
  ];
  const icnFlightOptions: FlightOption[] = [
    {
      id: 'icn1',
      type: '가성비 끝판왕 (인천 출발)',
      airline: '에티하드 항공 등 중동 항공사',
      route: 'ICN (서울/인천) ↔ CDG (파리)',
      duration: '약 21시간 소요',
      price: '약 6,400,000원',
      features: ['가장 저렴한 6인 요금 (김해 출발 대비 거의 절반)', '부산 ↔ 서울 KTX (왕복 약 70만 원) 고려해도 수백만 원 오차 압도적 절약', '아부다비 대기 3~4시간'],
      skyscannerUrl: `https://www.skyscanner.co.kr/transport/flights/icn/cdg/${departureDate}/${returnDate}/?adultsv2=${adults}&cabinclass=economy&rtn=1`,
      isRecommended: true
    },
    {
      id: 'icn2',
      type: '가성비 직항 (인천 출발)',
      airline: '티웨이항공 (직항)',
      route: 'ICN (서울/인천) ↔ CDG (파리)',
      duration: '약 15시간 소요',
      price: '약 10,330,000원',
      features: ['환승 및 수하물 분실 리스크 없음', '직항의 편안함과 저렴함을 동시에', '국적기 대비 약 30% 저렴'],
      skyscannerUrl: `https://www.skyscanner.co.kr/transport/flights/icn/cdg/${departureDate}/${returnDate}/?adultsv2=${adults}&cabinclass=economy&rtn=1`
    }
  ];

  return (
    <div className="flights-container">
      <h1 className="page-title">✈️ 항공권 추천</h1>
      
      <div className="summary-banner">
        <h2>💡 AI 리서치 핵심 제안</h2>
        <p>기존 <strong>[7월 30일 출발]</strong> 대비 <strong>[7월 29일(화)]</strong> 출발로 요금을 낮출 수 있습니다. <strong>김해공항(PUS)</strong> 출발과 출발 전 <strong>KTX를 타고 인천(ICN)</strong>으로 이동하여 비용을 절반 가까이 아끼는 두 가지 대안을 비교해 보세요.</p>
      </div>

      <div className="flight-controls glass mb-2">
        <h2 style={{ fontSize: '1.25rem', color: 'var(--secondary)', marginBottom: '1.5rem', fontFamily: "'Cormorant Garamond', serif" }}>📊 6인 요금 vs 소요 시간 비교결과</h2>
        
        <div style={{ marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
            <span>김해 (편안함 / 1경유)</span>
            <span style={{ fontWeight: 600, textAlign: 'right' }}>약 1,324만 원<br/><span style={{ fontSize:'0.8rem', color:'var(--text-muted)', fontWeight: 400 }}>16h 55m</span></span>
          </div>
          <div style={{ width: '100%', background: 'var(--border-color)', height: '12px', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ width: '100%', background: '#EF4444', height: '100%' }}></div>
          </div>
        </div>

        <div style={{ marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
            <span>김해 (최우선 / 2경유)</span>
            <span style={{ fontWeight: 600, textAlign: 'right' }}>약 1,217만 원<br/><span style={{ fontSize:'0.8rem', color:'var(--text-muted)', fontWeight: 400 }}>약 30h</span></span>
          </div>
          <div style={{ width: '100%', background: 'var(--border-color)', height: '12px', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ width: '92%', background: '#F59E0B', height: '100%' }}></div>
          </div>
        </div>

        <div style={{ marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
            <span>인천 (가성비 직항)</span>
            <span style={{ fontWeight: 600, textAlign: 'right' }}>약 1,033만 원<br/><span style={{ fontSize:'0.8rem', color:'var(--text-muted)', fontWeight: 400 }}>직항 15h (+KTX 3h)</span></span>
          </div>
          <div style={{ width: '100%', background: 'var(--border-color)', height: '12px', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ width: '78%', background: '#3B82F6', height: '100%' }}></div>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
            <span>인천 (초특가 / 1경유)</span>
            <span style={{ fontWeight: 600, color: 'var(--secondary)', textAlign: 'right' }}>약 640만 원<br/><span style={{ fontSize:'0.8rem', color:'var(--text-muted)', fontWeight: 400 }}>경유 21h (+KTX 3h)</span></span>
          </div>
          <div style={{ width: '100%', background: 'var(--border-color)', height: '12px', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ width: '48%', background: '#10B981', height: '100%' }}></div>
          </div>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          * <strong>비용 vs 체력(시간)</strong>의 교환입니다. 인천(ICN) 출발 초특가를 선택하면 이동 시간이 늘어나는 대신 6명 합산 <strong>총 600만 원 이상</strong> 절약 가능합니다.
        </p>
      </div>

      <div className="flight-controls glass mb-2">
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--secondary)' }}>🔍 스카이스캐너 실시간 조회 설정</h3>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', color: 'var(--text-muted)', fontWeight: 500 }}>검색 인원</label>
            <select className="flight-input" value={adults} onChange={e => setAdults(Number(e.target.value))}>
              <option value={4}>4명</option>
              <option value={5}>5명</option>
              <option value={6}>6명</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', color: 'var(--text-muted)', fontWeight: 500 }}>가는 날 (YYMMDD)</label>
            <input className="flight-input" type="text" value={departureDate} onChange={e => setDepartureDate(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', color: 'var(--text-muted)', fontWeight: 500 }}>오는 날 (YYMMDD)</label>
            <input className="flight-input" type="text" value={returnDate} onChange={e => setReturnDate(e.target.value)} />
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--secondary)', fontFamily: "'Cormorant Garamond', serif" }}>📌 추천 1: 김해(PUS) 출발</h2>
      <div className="flight-cards-grid mb-2">
        {flightOptions.map(opt => (
          <div key={opt.id} className={`flight-card ${opt.isRecommended ? 'recommended' : ''}`}>
            {opt.isRecommended && <div className="badge">⭐ 편안함 추천</div>}
            <div className="flight-type">{opt.type}</div>
            <h3 className="flight-airline">{opt.airline}</h3>
            
            <table className="flight-details">
              <tbody>
                <tr>
                  <td>경로</td>
                  <td><strong>{opt.route}</strong></td>
                </tr>
                <tr>
                  <td>소요</td>
                  <td>{opt.duration}</td>
                </tr>
                <tr>
                  <td>6인 예상 요금</td>
                  <td className="flight-price">{opt.price}</td>
                </tr>
              </tbody>
            </table>

            <ul className="flight-features">
              {opt.features.map((feature, i) => (
                <li key={i}>
                  <span style={{ color: 'var(--primary)', fontSize: '1.2rem', lineHeight: 1 }}>•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <a href={opt.skyscannerUrl} target="_blank" rel="noopener noreferrer" className="skyscanner-btn">
              스카이스캐너 조회 →
            </a>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '1.4rem', marginTop: '2.5rem', marginBottom: '1rem', color: 'var(--secondary)', fontFamily: "'Cormorant Garamond', serif" }}>📌 추천 2: 인천(ICN) 출발</h2>
      <div className="flight-cards-grid">
        {icnFlightOptions.map(opt => (
          <div key={opt.id} className={`flight-card ${opt.isRecommended ? 'recommended' : ''}`}>
            {opt.isRecommended && <div className="badge">⭐ 가성비 끝판왕</div>}
            <div className="flight-type">{opt.type}</div>
            <h3 className="flight-airline">{opt.airline}</h3>
            
            <table className="flight-details">
              <tbody>
                <tr>
                  <td>경로</td>
                  <td><strong>{opt.route}</strong></td>
                </tr>
                <tr>
                  <td>소요</td>
                  <td>{opt.duration}</td>
                </tr>
                <tr>
                  <td>6인 예상 요금</td>
                  <td className="flight-price">{opt.price}</td>
                </tr>
              </tbody>
            </table>

            <ul className="flight-features">
              {opt.features.map((feature, i) => (
                <li key={i}>
                  <span style={{ color: 'var(--primary)', fontSize: '1.2rem', lineHeight: 1 }}>•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <a href={opt.skyscannerUrl} target="_blank" rel="noopener noreferrer" className="skyscanner-btn">
              스카이스캐너 조회 →
            </a>
          </div>
        ))}
      </div>

      {/* 사용자 추천 항목 영역 */}
      <h2 style={{ fontSize: '1.5rem', marginTop: '4rem', marginBottom: '1rem', color: 'var(--secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '2.5rem', fontFamily: "'Cormorant Garamond', serif" }}>👥 팀원 검색 결과 투표</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: 1.6 }}>스카이스캐너에서 검색하신 좋은 비행기 일정을 기록하고 다른 사람에게 추천해보세요!</p>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setIsAddingRec(!isAddingRec)}
          className={`btn-primary`}
          style={{ width: '100%', padding: '16px' }}
        >
          {isAddingRec ? '✖ 작성 취소' : '➕ 내가 찾은 항공권 등록하기'}
        </button>
      </div>

      {isAddingRec && (
        <div className="glass" style={{ padding: '1.5rem', marginBottom: '2rem', animation: 'fadeIn 0.3s' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--secondary)', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem' }}>새로운 항공권 등록</h3>
          <form onSubmit={handleAddRec} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>항공사 및 경유 정보</label>
              <input required type="text" className="flight-input" placeholder="예: 에어프랑스 직항" value={newRec.airline} onChange={e => setNewRec({...newRec, airline: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>경로 (출발↔도착)</label>
              <input required type="text" className="flight-input" placeholder="예: ICN ↔ CDG" value={newRec.route} onChange={e => setNewRec({...newRec, route: e.target.value})} />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>출발일</label>
                <input required type="text" className="flight-input" placeholder="예: 7/29" value={newRec.departureDate} onChange={e => setNewRec({...newRec, departureDate: e.target.value})} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>도착일</label>
                <input required type="text" className="flight-input" placeholder="예: 8/12" value={newRec.returnDate} onChange={e => setNewRec({...newRec, returnDate: e.target.value})} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>예상 요금 (6인 기준)</label>
              <input required type="text" className="flight-input" placeholder="예: 약 1,100만원" value={newRec.price} onChange={e => setNewRec({...newRec, price: e.target.value})} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>소요 시간</label>
              <input type="text" className="flight-input" placeholder="예: 출국 18시간 / 귀국 15시간" value={newRec.duration} onChange={e => setNewRec({...newRec, duration: e.target.value})} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>코멘트 및 추천 이유</label>
              <textarea className="flight-input" placeholder="비행 시간이 적절합니다!" value={newRec.memo} onChange={e => setNewRec({...newRec, memo: e.target.value})} style={{ minHeight: '100px', resize: 'vertical', borderRadius: '12px' }}></textarea>
            </div>

            <button type="submit" style={{ width: '100%', marginTop: '0.5rem' }}>
              ✔ 이 비행기 추천하기
            </button>
          </form>
        </div>
      )}

      <div className="flight-cards-grid">
        {userRecommendations.length === 0 && !isAddingRec ? (
          <div className="glass" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>아직 팀원이 추천한 항공권이 없습니다.</p>
          </div>
        ) : (
          userRecommendations.map((rec: any) => (
            <div key={rec.id} className="flight-card glass">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  👤 <strong>{rec.user_name}</strong>님의 추천
                </div>
                <button 
                  onClick={() => handleVote(rec.id)}
                  className={rec.has_voted ? 'btn-primary' : 'btn-outline'}
                  style={{
                    padding: '6px 16px', fontSize: '0.85rem'
                  }}
                >
                  {rec.has_voted ? '❤️' : '🤍'} {rec.vote_count}
                </button>
              </div>
              <h3 className="flight-airline">{rec.airline}</h3>
              
              <table className="flight-details">
                <tbody>
                  <tr>
                    <td>경로</td>
                    <td><strong>{rec.route}</strong></td>
                  </tr>
                  <tr>
                    <td>일정</td>
                    <td>{rec.departure_date} ~ {rec.return_date}</td>
                  </tr>
                  <tr>
                    <td>소요시간</td>
                    <td>{rec.duration}</td>
                  </tr>
                  <tr>
                    <td>예상요금</td>
                    <td className="flight-price">{rec.price}</td>
                  </tr>
                </tbody>
              </table>

              {rec.memo && (
                <div style={{ background: 'rgba(0,0,0,0.03)', padding: '1rem', borderRadius: '8px', fontSize: '0.95rem', color: 'var(--secondary)', borderLeft: '3px solid var(--primary)', lineHeight: 1.5 }}>
                  "{rec.memo}"
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}

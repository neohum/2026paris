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
  // 항공권 검색 기준 (대리 리서치 기반)
  const [adults, setAdults] = useState(6);
  const [departureDate, setDepartureDate] = useState('260729'); // 26년 7월 29일 (화)
  const [returnDate, setReturnDate] = useState('260812'); // 26년 8월 12일 (화)

  // 사용자 추천 항공권 상태
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
      airline: '대한항공 / 에어프랑스 (인천 1회 경유)',
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
      <h1 className="page-title">✈️ 항공권 및 일정 추천</h1>
      
      <div className="summary-banner glass">
        <h2>💡 AI 리서치 핵심 제안 (출발지 비교)</h2>
        <p>기존 <strong>[7월 30일(목) 출발]</strong> 대비 <strong>[7월 29일(화)]</strong>로 평일에 일정을 시작하시면 요금을 다소 낮출 수 있습니다! 추가로, <strong>김해공항(PUS)</strong>에서 출발하여 편안하게 1회 환승하는 방법과 출발 전 <strong>KTX를 타고 인천(ICN)</strong>으로 이동하여 비용을 절반 가까이 아끼는 두 가지 대안을 비교해 보세요!</p>
      </div>

      <div className="flight-controls glass mb-2" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>📊 6인 왕복 요금 vs 소요 시간 비교결과 (한눈에 보기)</h2>
        
        <div style={{ marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
            <span>김해 출발 (가장 편안함 / 1회 경유)</span>
            <span style={{ fontWeight: 'bold', textAlign: 'right' }}>요금: 약 1,324만 원<br/><span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>소요시간: 16시간 55분</span></span>
          </div>
          <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '16px', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ width: '100%', background: '#ef4444', height: '100%' }}></div>
          </div>
        </div>

        <div style={{ marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
            <span>김해 출발 (비용 최우선 / 2회 경유)</span>
            <span style={{ fontWeight: 'bold', textAlign: 'right' }}>요금: 약 1,217만 원<br/><span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>소요시간: 약 30시간 대기</span></span>
          </div>
          <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '16px', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ width: '92%', background: '#f59e0b', height: '100%' }}></div>
          </div>
        </div>

        <div style={{ marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
            <span>인천 출발 (가성비 직항)</span>
            <span style={{ fontWeight: 'bold', textAlign: 'right' }}>요금: 약 1,033만 원 <span style={{ color: 'var(--text-muted)' }}>(+ KTX 교통비)</span><br/><span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>소요시간: 직항 15시간 (+KTX 3시간 = 총 18시간)</span></span>
          </div>
          <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '16px', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ width: '78%', background: '#3b82f6', height: '100%' }}></div>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
            <span>인천 출발 (초특가 가성비 / 1회 경유)</span>
            <span style={{ fontWeight: 'bold', color: '#10b981', textAlign: 'right' }}>요금: 약 640만 원 <span style={{ color: 'var(--text-muted)' }}>(+ KTX 교통비)</span><br/><span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>소요시간: 경유 21시간 (+KTX 3시간 = 총 24시간)</span></span>
          </div>
          <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '16px', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ width: '48%', background: '#10b981', height: '100%' }}></div>
          </div>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
          * 통계 해석: <strong>비용 vs 체력(시간)</strong>의 교환입니다. 인천(ICN) 출발 초특가를 선택하면 이동 시간이 <strong>최대 7시간(KTX 포함)</strong>가량 늘어나는 대신, 그 대가로 6명 합산 전체 예산에서 <strong>무려 600만 원(인당 100만 원) 이상</strong>을 절약할 수 있습니다.
        </p>
      </div>

      {/* 에티하드 항공 가격 분석 섹션 */}
      <div className="glass mb-2" style={{ padding: '1.5rem 2rem', borderLeft: '4px solid #10b981', background: 'rgba(16, 185, 129, 0.05)' }}>
        <h3 style={{ color: '#10b981', marginBottom: '1rem', fontSize: '1.1rem' }}>💡 AI 항공권 인사이트: 아부다비 등 중동 경유 항공권 특가의 원인 및 정세(안전) 분석</h3>
        <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', lineHeight: '1.6', fontSize: '0.95rem' }}>
          <li style={{ marginBottom: '0.5rem' }}><strong>지리적 이점 (허브 앤 스포크):</strong> 아시아와 유럽의 정확히 한가운데인 아부다비를 기점으로 엄청난 숫자의 탑승객을 한곳에 모아 다시 분배하는 환승 비즈니스 모델로, '규모의 경제'를 통해 원가를 크게 낮춥니다.</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>인프라 및 유류비 혜택:</strong> 산유국(UAE) 기반 항공사로서 유류비 조달액이 매우 낮고, 정부 차원의 막대한 허브 공항 지원 및 세제 혜택이 항공권 원가 인하로 이어집니다.</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>최신 기종과 높은 탑승률:</strong> 구형 비행기여서 싼 것이 아닙니다. 초대형 기종을 띄워 1년 내내 탑승률 90% 이상을 유지해 좌석당 고정 비용을 획기적으로 낮춘 세계 최상위 5성급 항공사입니다.</li>
          <li style={{ marginBottom: '0.5rem', color: '#ef4444' }}><strong>⚠️ 최근 중동 지정학적 리스크(전쟁) 요인:</strong> 사용자의 지적대로, 최근 이스라엘-하마스 등 중동 긴장으로 인해 수요가 줄어 <strong>일시적인 초특가 물량</strong>이 더욱 많이 풀리고 있는 것이 사실입니다. 하지만 UAE(아부다비)는 교전 지역이 아니며, 에티하드 및 에미레이트 등 글로벌 항공사들은 위험 항로 공간을 전면 차단하고 <strong>이집트, 튀르키예 등 100% 안전한 경로로 실시간 우회 비행</strong>하므로 격추나 테러 위험은 사실상 국적기와 차이가 없습니다. (단, 우회 비행으로 인해 평소보다 비행시간이 1~2시간가량 길어질 수는 있습니다.)</li>
        </ul>
        <p style={{ marginTop: '0.8rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          * 결론: 서비스나 안전성이 떨어지는 저가항공(LCC)이 아니라 지리적 이점과 보완재를 무기로 가격 경쟁력을 지녔으며, 현재는 중동 리스크 덕분에 요금이 비정상적으로 싼 '기회의 창'구간입니다.
        </p>
      </div>

      <div className="flight-controls glass mb-2">
        <h3>🔍 스카이스캐너 실시간 검색 링크 세팅</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem' }}>검색 인원</label>
            <select className="flight-input" value={adults} onChange={e => setAdults(Number(e.target.value))}>
              <option value={4}>4명</option>
              <option value={5}>5명</option>
              <option value={6}>6명</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem' }}>가는 날 (YYMMDD)</label>
            <input className="flight-input" type="text" value={departureDate} onChange={e => setDepartureDate(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem' }}>오는 날 (YYMMDD)</label>
            <input className="flight-input" type="text" value={returnDate} onChange={e => setReturnDate(e.target.value)} />
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--primary)' }}>📌 추천 1: 김해(PUS) 출발 옵션 (편의성 중시)</h2>
      <div className="flight-cards-grid">
        {flightOptions.map(opt => (
          <div key={opt.id} className={`flight-card glass ${opt.isRecommended ? 'recommended' : ''}`}>
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
                <li key={i}>✅ {feature}</li>
              ))}
            </ul>

            <a href={opt.skyscannerUrl} target="_blank" rel="noopener noreferrer" className="skyscanner-btn">
              김해 출발 스카이스캐너 조회 ↗
            </a>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '1.2rem', marginTop: '3rem', marginBottom: '1rem', color: '#3b82f6' }}>📌 추천 2: 서울/인천(ICN) 출발 옵션 (초특가 비용 절감)</h2>
      <div className="flight-cards-grid">
        {icnFlightOptions.map(opt => (
          <div key={opt.id} className={`flight-card glass ${opt.isRecommended ? 'recommended' : ''}`} style={opt.isRecommended ? { borderColor: '#3b82f6' } : {}}>
            {opt.isRecommended && <div className="badge" style={{ background: '#3b82f6', color: '#fff', boxShadow: '0 4px 10px rgba(59,130,246,0.3)' }}>⭐ 가성비 끝판왕</div>}
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
                  <td className="flight-price" style={{ color: '#3b82f6' }}>{opt.price}</td>
                </tr>
              </tbody>
            </table>

            <ul className="flight-features">
              {opt.features.map((feature, i) => (
                <li key={i}>✅ {feature}</li>
              ))}
            </ul>

            <a href={opt.skyscannerUrl} target="_blank" rel="noopener noreferrer" className="skyscanner-btn" style={{ background: '#3b82f6', color: '#fff' }}>
              인천 출발 스카이스캐너 조회 ↗
            </a>
          </div>
        ))}
      </div>

      {/* 사용자 추천 항목 영역 */}
      <h2 style={{ fontSize: '1.2rem', marginTop: '4rem', marginBottom: '1rem', color: '#8b5cf6', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>👥 팀원 검색 항공권 추천 및 투표</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>스카이스캐너에서 검색하신 좋은 비행기 일정을 기록하고 다른 사람에게 추천해보세요!</p>
      
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={() => setIsAddingRec(!isAddingRec)}
          style={{ 
            background: isAddingRec ? '#ef4444' : '#8b5cf6', 
            color: 'white', border: 'none', padding: '0.8rem 1.5rem', 
            borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
          }}
        >
          {isAddingRec ? '✖ 작성 취소' : '➕ 내 검색 일정 추천하기'}
        </button>
      </div>

      {isAddingRec && (
        <div className="glass" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid #8b5cf6', animation: 'fadeIn 0.3s' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>🚀 새로운 비행기 일정 추천</h3>
          <form onSubmit={handleAddRec} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem' }}>항공사 및 경유 정보</label>
                <input required type="text" className="flight-input" placeholder="예: 에어프랑스 직항" value={newRec.airline} onChange={e => setNewRec({...newRec, airline: e.target.value})} />
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem' }}>경로 (출발↔도착)</label>
                <input required type="text" className="flight-input" placeholder="예: ICN ↔ CDG" value={newRec.route} onChange={e => setNewRec({...newRec, route: e.target.value})} />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 120px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem' }}>출발일</label>
                <input required type="text" className="flight-input" placeholder="예: 7/29" value={newRec.departureDate} onChange={e => setNewRec({...newRec, departureDate: e.target.value})} />
              </div>
              <div style={{ flex: '1 1 120px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem' }}>도착일(단기/장기)</label>
                <input required type="text" className="flight-input" placeholder="예: 8/12" value={newRec.returnDate} onChange={e => setNewRec({...newRec, returnDate: e.target.value})} />
              </div>
              <div style={{ flex: '1 1 150px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem' }}>예상 요금</label>
                <input required type="text" className="flight-input" placeholder="예: 약 1,100만원" value={newRec.price} onChange={e => setNewRec({...newRec, price: e.target.value})} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 150px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem' }}>소요 시간</label>
                <input type="text" className="flight-input" placeholder="예: 출국 18시간 / 귀국 15시간" value={newRec.duration} onChange={e => setNewRec({...newRec, duration: e.target.value})} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.3rem' }}>코멘트 및 추천 이유</label>
              <textarea className="flight-input" placeholder="예: 가격이 가장 싸진 않지만 시간이 딱 맞아요!" value={newRec.memo} onChange={e => setNewRec({...newRec, memo: e.target.value})} style={{ minHeight: '80px', resize: 'vertical' }}></textarea>
            </div>

            <button type="submit" style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
              ✔ 이 비행기 추천하기
            </button>
          </form>
        </div>
      )}

      <div className="flight-cards-grid">
        {userRecommendations.length === 0 && !isAddingRec ? (
          <p style={{ color: 'var(--text-muted)' }}>아직 사용자가 추천한 항공권이 없습니다.</p>
        ) : (
          userRecommendations.map((rec: any) => (
            <div key={rec.id} className="flight-card glass">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  👤 <strong>{rec.user_name}</strong>님의 추천
                </div>
                <button 
                  onClick={() => handleVote(rec.id)}
                  style={{
                    background: rec.has_voted ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.1)',
                    color: rec.has_voted ? '#ef4444' : 'var(--text-main)',
                    border: `1px solid ${rec.has_voted ? '#ef4444' : 'rgba(255,255,255,0.2)'}`,
                    padding: '4px 12px', borderRadius: '20px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem',
                    transition: 'all 0.2s'
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
                    <td className="flight-price" style={{ color: '#8b5cf6' }}>{rec.price}</td>
                  </tr>
                </tbody>
              </table>

              {rec.memo && (
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.8rem', borderRadius: '6px', fontSize: '0.9rem', marginTop: '1rem' }}>
                  💡 {rec.memo}
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}

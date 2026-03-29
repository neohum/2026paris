'use client';

import { useState } from 'react';
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

  const flightOptions: FlightOption[] = [
    {
      id: 'opt1',
      type: '가성비 끝판왕',
      airline: '에티하드 항공 (경유 1회)',
      route: 'ICN (서울) ↔ CDG (파리)',
      duration: '약 21시간 소요',
      price: '약 6,400,000원',
      features: ['가장 저렴한 6인 요금', '아부다비 대기 3~4시간', '부산 ↔ 서울 KTX 고려해도 압도적 절약'],
      skyscannerUrl: `https://www.skyscanner.co.kr/transport/flights/icn/cdg/${departureDate}/${returnDate}/?adultsv2=${adults}&cabinclass=economy&rtn=1`,
      isRecommended: true
    },
    {
      id: 'opt2',
      type: '가성비 직항',
      airline: '티웨이항공 (직항)',
      route: 'ICN (서울) ↔ CDG (파리)',
      duration: '약 15시간 소요',
      price: '약 10,330,000원',
      features: ['환승 및 수하물 분실 리스크 없음', '비용과 시간의 적절한 밸런스', '국적기 대비 저렴한 직항 옵션'],
      skyscannerUrl: `https://www.skyscanner.co.kr/transport/flights/icn/cdg/${departureDate}/${returnDate}/?adultsv2=${adults}&cabinclass=economy&rtn=1`
    },
    {
      id: 'opt3',
      type: '기존 일정/무조건 부산 출발',
      airline: '대한항공 / 에어프랑스 (인천 경유)',
      route: 'PUS (부산) ↔ CDG (파리)',
      duration: '약 17시간 소요',
      price: '약 13,240,000원',
      features: ['가장 편안한 프리미엄 국적기', '기존 계획하셨던 7/30~8/11일정 시뮬레이션', '가장 높은 비용'],
      skyscannerUrl: `https://www.skyscanner.co.kr/transport/flights/pus/cdg/260730/260811/?adultsv2=${adults}&cabinclass=economy&rtn=1`
    }
  ];

  return (
    <div className="flights-container">
      <h1 className="page-title">✈️ 항공권 및 일정 추천</h1>
      
      <div className="summary-banner glass">
        <h2>💡 AI 리서치 핵심 제안</h2>
        <p>기존 <strong>[부산 출발 / 7월 30일(목) 출발]</strong> 스케줄 대신, <strong>[서울(인천) 출발 / 7월 29일(화) 출발]</strong>로 하루만 일정을 앞당기시면 6명 기준 <strong>최대 약 680만 원 절감이 가능</strong>합니다!</p>
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

      <div className="flight-cards-grid">
        {flightOptions.map(opt => (
          <div key={opt.id} className={`flight-card glass ${opt.isRecommended ? 'recommended' : ''}`}>
            {opt.isRecommended && <div className="badge">⭐ AI 강력 추천</div>}
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
              스카이스캐너 실시간 검색 ↗
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

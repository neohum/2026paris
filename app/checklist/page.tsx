'use client';

import { useState, useEffect } from 'react';
import './checklist.css';

type CheckItem = {
  id: string;
  category: string;
  label: string;
  desc?: string;
  checked: boolean;
};

const defaultItems: CheckItem[] = [
  // 여권 및 서류
  { id: 'doc-1', category: '여권 및 서류 🛂', label: '여권 (유효기간 6개월 이상)', desc: '원본 및 분실 대비 여권 사본 2장, 여권 사진 2장', checked: false },
  { id: 'doc-2', category: '여권 및 서류 🛂', label: '항공권 e-티켓', desc: '프린트된 종이 사본 권장', checked: false },
  { id: 'doc-3', category: '여권 및 서류 🛂', label: '영문 여행자 보험 가입 증명서', checked: false },
  { id: 'doc-4', category: '여권 및 서류 🛂', label: '국제 운전 면허증 및 국내 면허증', desc: '렌터카 운전자 필수', checked: false },
  { id: 'doc-5', category: '여권 및 서류 🛂', label: '숙박 바우처', desc: '호텔/에어비앤비 예약 확인증', checked: false },

  // 전자기기
  { id: 'elec-1', category: '전자기기 📱', label: '해외 로밍 / 유심 / eSIM', desc: '미리 구매 및 세팅 방법 캡처 필수', checked: false },
  { id: 'elec-2', category: '전자기기 📱', label: '멀티 어댑터 및 멀티탭', desc: '프랑스는 220V지만 콘센트 구멍 크기(Type E)가 달라 안 꽂히는 한국 플러그가 있음', checked: false },
  { id: 'elec-3', category: '전자기기 📱', label: '대용량 보조 배터리', desc: '지도 검색, 사진 촬영으로 배터리 소모가 극도로 빠름', checked: false },
  { id: 'elec-4', category: '전자기기 📱', label: '충전 케이블 (C타입, 라이트닝 넉넉히)', checked: false },

  // 의류 및 뷰티
  { id: 'cloth-1', category: '의류 및 잡화 👕', label: '착화감이 좋은 운동화', desc: '프랑스는 돌길(코블스톤)이 많아 발이 매우 아픔', checked: false },
  { id: 'cloth-2', category: '의류 및 잡화 👕', label: '바람막이 및 얇은 가디건', desc: '여름이어도 일교차가 크고, 몽생미셸 등 해안가는 춥고 바람이 많이 붊', checked: false },
  { id: 'cloth-3', category: '의류 및 잡화 👕', label: '자외선 차단제 및 선글라스', desc: '여름 유럽의 햇살은 한국보다 훨씬 뜨거움', checked: false },
  { id: 'cloth-4', category: '의류 및 잡화 👕', label: '접이식 가벼운 우산', desc: '노르망디 등 근교는 매우 변덕스러운 날씨의 소나기 다발 지역임', checked: false },
  { id: 'cloth-5', category: '의류 및 잡화 👕', label: '에코백 또는 가벼운 천 가방', desc: '마트 장보기 필수 (봉투 안 줌), 소매치기 대비용 크로스백', checked: false },
  { id: 'cloth-6', category: '의류 및 잡화 👕', label: '개인용 세면도구', desc: '유럽 호텔은 일회용 칫솔/치약을 절대 제공하지 않음', checked: false },

  // 상비약 및 기타
  { id: 'med-1', category: '상비약 및 결제 수단 💊', label: '개인 상비약', desc: '종합감기약, 진통제, 소화제(유럽 식사 대비), 지사제, 밴드', checked: false },
  { id: 'med-2', category: '상비약 및 결제 수단 💊', label: '트래블월렛 / 트래블로그 카드', desc: '프랑스는 99% 컨택트리스(비접촉식) 카드 결제 가능', checked: false },
  { id: 'med-3', category: '상비약 및 결제 수단 💊', label: '비상용 유로화 (현금)', desc: '1~2백 유로 내외, 동전은 빵집이나 공중화장실 조심', checked: false },
  { id: 'med-4', category: '상비약 및 결제 수단 💊', label: '컵라면 / 김 / 튜브 고추장', desc: '한식이 그리울 때 숙소 야식으로 최고 (장기 여행 필수)', checked: false }
];

export default function ChecklistPage() {
  const [items, setItems] = useState<CheckItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('france_packing_checklist');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch(e) {
        setItems(defaultItems);
      }
    } else {
      setItems(defaultItems);
    }
  }, []);

  const saveItems = (newItems: CheckItem[]) => {
    setItems(newItems);
    localStorage.setItem('france_packing_checklist', JSON.stringify(newItems));
  };

  const toggleCheck = (id: string) => {
    const newItems = items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    saveItems(newItems);
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    
    const newItem: CheckItem = {
      id: `custom-${Date.now()}`,
      category: '내가 추가한 물품 🎒',
      label: newItemText,
      checked: false
    };
    
    saveItems([...items, newItem]);
    setNewItemText('');
  };

  const deleteItem = (id: string) => {
    if (confirm('이 항목을 삭제하시겠습니까?')) {
      const newItems = items.filter(item => item.id !== id);
      saveItems(newItems);
    }
  };

  const resetAll = () => {
    if (confirm('정말로 모든 체크를 초기화하시겠습니까?\n(추가된 목록은 유지됩니다)')) {
      const newItems = items.map(i => ({ ...i, checked: false }));
      saveItems(newItems);
    }
  };

  const clearDefault = () => {
    if (confirm('기본 목록으로 완전 초기화하시겠습니까?\n(직접 추가한 항목이 모두 삭제됩니다)')) {
      saveItems(defaultItems);
    }
  };

  // SSR 보장 (로컬스토리지 접근 시 hydration mismatch 방지)
  if (!isClient) {
    return <div className="checklist-container"><div className="text-center mt-5">리스트를 불러오는 중...</div></div>;
  }

  const checkedCount = items.filter(i => i.checked).length;
  const totalCount = items.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((checkedCount / totalCount) * 100);

  // 카테고리별로 그룹화
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, CheckItem[]>);

  return (
    <div className="checklist-container">
      <h1 className="page-title">🎒 여행 준비물 체크리스트</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>프랑스 여행을 떠나기 전 짐가방 진행도를 확인하세요.</p>

      {/* 진행 상황 대시보드 */}
      <div className="progress-dashboard glass">
        <div className="progress-header">
          <span>패킹(Packing) 진행률</span>
          <span style={{ color: progressPercent === 100 ? '#10b981' : 'var(--primary)', fontSize: '1.2rem' }}>
            {progressPercent}% <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>({checkedCount} / {totalCount})</span>
          </span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%`, background: progressPercent === 100 ? '#10b981' : 'linear-gradient(90deg, #3b82f6, #0ea5e9)' }}></div>
        </div>
        {progressPercent === 100 && (
          <p style={{ color: '#10b981', margin: 0, marginTop: '8px', fontSize: '0.95rem', fontWeight: 'bold' }}>🎉 모든 준비물 패킹 완료! 완벽하게 출발할 준비가 되었습니다!</p>
        )}
      </div>

      {/* 카테고리별 목록 */}
      {Object.entries(groupedItems).map(([category, itemsInCategory]) => (
        <div key={category} className="category-card glass">
          <h2 className="category-title">{category}</h2>
          <div>
            {itemsInCategory.map(item => (
              <div key={item.id} className={`check-item ${item.checked ? 'checked' : ''}`} onClick={() => toggleCheck(item.id)}>
                <input 
                  type="checkbox" 
                  checked={item.checked} 
                  onChange={() => {}} // 핸들러는 부모 onClick 으로 위임
                  onClick={(e) => e.stopPropagation()} 
                />
                <label onClick={(e) => e.stopPropagation()}>
                  {item.label}
                  {item.desc && <span className="item-desc">{item.desc}</span>}
                </label>
                {item.id.startsWith('custom-') && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                    style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', padding: '5px' }}
                    title="항목 삭제"
                  >
                    ✖
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* 자유 항목 추가 */}
      <div className="category-card glass" style={{ border: '1px solid rgba(59, 130, 246, 0.3)' }}>
        <h2 className="category-title" style={{ color: 'var(--text-main)' }}>➕ 내 준비물 추가하기</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>개인적으로 꼭 챙겨야 할 물품이 있다면 리스트에 추가하세요.</p>
        <form onSubmit={addItem} className="add-item-form">
          <input 
            type="text" 
            placeholder="예: 아이패드, 세면도구 파우치 등..." 
            value={newItemText} 
            onChange={(e) => setNewItemText(e.target.value)} 
          />
          <button type="submit">추가</button>
        </form>
      </div>
      
      {/* 관리 컨트롤 리모컨 */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '2rem' }}>
        <button onClick={resetAll} style={{ padding: '0.8rem 1.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>
          단순 체크 초기화
        </button>
        <button onClick={clearDefault} style={{ padding: '0.8rem 1.5rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#ef4444', borderRadius: '8px', cursor: 'pointer' }}>
          공유 리스트로 복구
        </button>
      </div>

    </div>
  );
}

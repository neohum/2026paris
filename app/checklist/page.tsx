'use client';

import { useState, useEffect } from 'react';
import './checklist.css';

type CheckItem = {
  id: string;
  category: string;
  label: string;
  desc?: string;
  checked: boolean;
  isAdminProvided?: boolean;
  isAdminMandatory?: boolean;
};

const defaultItems: CheckItem[] = [
  // 여권 및 서류
  { id: 'doc-1', category: '여권 및 서류 🛂', label: '여권 (유효기간 6개월 이상)', desc: '원본 및 분실 대비 여권 사본 2장, 여권 사진 2장', checked: false },
  { id: 'doc-4', category: '여권 및 서류 🛂', label: '국제 운전 면허증 및 국내 면허증', desc: '렌터카 운전자 필수', checked: false },

  // 전자기기
  { id: 'elec-1', category: '전자기기 📱', label: '해외 로밍 / 유심 / eSIM', desc: '미리 구매 및 세팅 방법 캡처 필수', checked: false },
  { id: 'elec-2', category: '전자기기 📱', label: '멀티 어댑터 및 멀티탭', desc: '프랑스는 220V지만 콘센트 구멍 크기가 달라 안 꽂히는 한국 플러그 존재', checked: false },
  { id: 'elec-4', category: '전자기기 📱', label: '충전 케이블 (C타입, 라이트닝 넉넉히)', checked: false },

  // 의류 및 뷰티
  { id: 'cloth-1', category: '의류 및 잡화 👕', label: '착화감이 좋은 운동화', desc: '프랑스는 돌길(코블스톤)이 많아 발이 아픔', checked: false },
  { id: 'cloth-2', category: '의류 및 잡화 👕', label: '바람막이 및 얇은 가디건', desc: '여름이어도 일교차가 크며 몽생미셸은 해상풍이 강함', checked: false },
  { id: 'cloth-3', category: '의류 및 잡화 👕', label: '자외선 차단제 및 선글라스', desc: '유럽 햇빛 대비 필수', checked: false },
  { id: 'cloth-4', category: '의류 및 잡화 👕', label: '접이식 가벼운 우산', desc: '노르망디 등 근교는 변덕스러운 날씨와 소나기 대비', checked: false },
  { id: 'cloth-5', category: '의류 및 잡화 👕', label: '에코백 또는 가벼운 천 가방', desc: '마트 장보기 밑 소매치기 대비용 크로스백', checked: false },
  { id: 'cloth-6', category: '의류 및 잡화 👕', label: '개인용 세면도구', desc: '호텔은 일회용 칫솔/치약을 제공하지 않음', checked: false },

  // 상비약 및 기타
  { id: 'med-1', category: '상비약 및 결제 수단 💊', label: '개인 상비약', desc: '감기약, 진통제, 소화제, 지사제, 밴드', checked: false },
  { id: 'med-2', category: '상비약 및 결제 수단 💊', label: '트래블월렛 / 트래블로그 카드', desc: '99% 컨택트리스 방식 카드 결제 통용', checked: false },
  { id: 'med-3', category: '상비약 및 결제 수단 💊', label: '비상용 유로화 (현금)', desc: '1~2백 유로 내외, 동전은 빵집이나 공중화장실 조심', checked: false },
  { id: 'med-4', category: '상비약 및 결제 수단 💊', label: '컵라면 / 김 / 튜브 고추장', desc: '숙소 야식 또는 한식 그리움 대비용', checked: false }
];

export default function ChecklistPage() {
  const [items, setItems] = useState<CheckItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    async function loadData() {
      const saved = localStorage.getItem('france_packing_checklist');
      let localItems = defaultItems;
      if (saved) {
        try {
          localItems = JSON.parse(saved);
        } catch(e) {}
      }

      try {
        const res = await fetch('/api/admin/checklists');
        if (res.ok) {
          const adminData = await res.json();
          const userItemsOnly = localItems.filter((i: CheckItem) => !i.id.startsWith('admin-'));
          
          const newAdminItems = adminData.map((c: any) => {
            const adminId = `admin-${c.id}`;
            const previousState = localItems.find((i: CheckItem) => i.id === adminId);
            return {
              id: adminId,
              category: '👨‍✈️ 관리자 공지 및 공용 물품',
              label: c.label,
              desc: c.description,
              checked: c.is_provided_by_admin ? true : (previousState ? previousState.checked : false),
              isAdminProvided: c.is_provided_by_admin,
              isAdminMandatory: !c.is_provided_by_admin
            };
          });

          setItems([...newAdminItems, ...userItemsOnly]);
        } else {
          setItems(localItems);
        }
      } catch(e) {
        setItems(localItems);
      }
    }
    loadData();
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

  if (!isClient) {
    return <div className="checklist-container"><div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-muted)' }}>리스트를 불러오는 중...</div></div>;
  }

  const checkedCount = items.filter(i => i.checked).length;
  const totalCount = items.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((checkedCount / totalCount) * 100);

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, CheckItem[]>);

  return (
    <div className="checklist-container">
      <h1 className="page-title">준비물 리스트</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: 1.6 }}>프랑스 여행을 떠나기 전 개인 짐가방 진행도를 체크하세요.</p>

      {/* 진행 상황 대시보드 */}
      <div className="progress-dashboard">
        <div className="progress-header">
          <span>패킹(Packing) 진행률</span>
          <span style={{ color: progressPercent === 100 ? 'var(--primary)' : 'var(--secondary)', fontSize: '1.25rem', fontFamily: "'Cormorant Garamond', serif" }}>
            {progressPercent}% <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'normal', fontFamily: 'Inter' }}>({checkedCount} / {totalCount})</span>
          </span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%`, background: progressPercent === 100 ? 'var(--primary)' : 'var(--secondary)' }}></div>
        </div>
        {progressPercent === 100 && (
          <p style={{ color: 'var(--primary)', margin: 0, marginTop: '8px', fontSize: '0.95rem', fontWeight: 600 }}>🎉 모든 준비물 패킹 완료! 완벽하게 출발할 준비가 되었습니다!</p>
        )}
      </div>

      {/* 카테고리별 목록 */}
      <div className="checklist-grid">
      {Object.entries(groupedItems).map(([category, itemsInCategory]) => (
        <div key={category} className="category-card">
          <h2 className="category-title">{category}</h2>
          <div>
            {itemsInCategory.map(item => (
              <div key={item.id} className={`check-item ${item.checked ? 'checked' : ''}`} onClick={() => {
                if (!item.isAdminProvided) toggleCheck(item.id);
              }}>
                <input 
                  type="checkbox" 
                  checked={item.checked} 
                  disabled={item.isAdminProvided}
                  onChange={() => {
                    if (!item.isAdminProvided) toggleCheck(item.id);
                  }} 
                  onClick={(e) => e.stopPropagation()} 
                />
                <label onClick={(e) => {
                  e.stopPropagation();
                  if (!item.isAdminProvided) toggleCheck(item.id);
                }} style={{ opacity: item.isAdminProvided ? 0.7 : 1 }}>
                  {item.isAdminProvided && <span style={{fontSize:'0.75rem', background:'var(--secondary)', color:'white', padding:'2px 6px', borderRadius:'4px', marginRight:'8px'}}>✔ 관리자가 챙김</span>}
                  {item.isAdminMandatory && <span style={{fontSize:'0.75rem', background:'var(--primary-hover)', color:'white', padding:'2px 6px', borderRadius:'4px', marginRight:'8px'}}>🔔 필수 개별지참</span>}
                  {item.label}
                  {item.desc && <span className="item-desc">{item.desc}</span>}
                </label>
                {item.id.startsWith('custom-') && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                    style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', padding: '5px', fontSize: '0.9rem' }}
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
      <div className="category-card" style={{ border: '1px solid var(--primary)', background: '#fff' }}>
        <h2 className="category-title" style={{ color: 'var(--secondary)', borderBottom: 'none', paddingBottom: 0, marginBottom: '0.5rem' }}>➕ 내 준비물 추가</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>개인적으로 챙겨야 할 물품을 리스트에 추가하세요.</p>
        <form onSubmit={addItem} className="add-item-form">
          <input 
            type="text" 
            placeholder="예: 수영복, 세면용품 파우치..." 
            value={newItemText} 
            onChange={(e) => setNewItemText(e.target.value)} 
          />
          <button type="submit">추가</button>
        </form>
      </div>
      </div>
      
      {/* 관리자 도구 */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '2.5rem' }}>
        <button onClick={resetAll} className="btn-outline" style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
          단순 체크 초기화
        </button>
        <button onClick={clearDefault} className="btn-outline" style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
          초기 목록으로 복구
        </button>
      </div>

    </div>
  );
}

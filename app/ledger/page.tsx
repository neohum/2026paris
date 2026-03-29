'use client';

import { useState, useEffect } from 'react';

type LedgerRecord = {
  id: number;
  date: string;
  category: string;
  amount: string;
  currency: string;
  payer_id: number;
  payer_name: string;
  memo: string;
};

type User = {
  id: number;
  name: string;
};

export default function LedgerPage() {
  const [records, setRecords] = useState<LedgerRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '식사',
    amount: '',
    currency: 'EUR',
    payer_id: '',
    memo: ''
  });

  const fetchData = async () => {
    try {
      const res = await fetch('/api/ledger');
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records);
        setUsers(data.users);
        if (data.users.length > 0 && !formData.payer_id) {
          setFormData(prev => ({ ...prev, payer_id: data.users[0].id.toString() }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.payer_id) return alert('금액과 결제자를 입력해주세요.');

    try {
      const res = await fetch('/api/ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormData({ ...formData, amount: '', memo: '' });
        fetchData(); 
      } else {
        alert('추가 실패');
      }
    } catch (err) {
      alert('서버 오류');
    }
  };

  const totalEur = records
    .filter(r => r.currency === 'EUR')
    .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  
  const perPersonAmount = users.length > 0 ? totalEur / users.length : 0;

  const paidByUser = users.reduce((acc, user) => {
    const sum = records
      .filter(r => r.currency === 'EUR' && r.payer_id === user.id)
      .reduce((s, curr) => s + parseFloat(curr.amount), 0);
    acc[user.id] = sum;
    return acc;
  }, {} as Record<number, number>);

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <h1 className="page-title">💶 공용 가계부 및 정산</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: 1.6 }}>팀 공동 경비 지출 내역을 기록하고 개인별 정산 금액을 확인하세요.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* 지출 입력 폼 */}
        <div className="glass" style={{ padding: '2rem', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontFamily: "'Cormorant Garamond', serif", color: 'var(--secondary)' }}>새 지출 내역 입력</h3>
          <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>날짜</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} className="flight-input" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>분류</label>
                <select name="category" value={formData.category} onChange={handleChange} className="flight-input">
                  <option value="식사">식사</option>
                  <option value="교통">교통 (렌터카, 주유 등)</option>
                  <option value="숙소">숙소</option>
                  <option value="관광">관광 (입장료)</option>
                  <option value="쇼핑">쇼핑</option>
                  <option value="기타">기타</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>금액</label>
                <input type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} className="flight-input" required placeholder="예: 45.5" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>통화</label>
                <select name="currency" value={formData.currency} onChange={handleChange} className="flight-input">
                  <option value="EUR">유로 (EUR)</option>
                  <option value="KRW">원 (KRW)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>결제자 (누가 냈나요?)</label>
              <select name="payer_id" value={formData.payer_id} onChange={handleChange} className="flight-input" required>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>내역 메모 (선택)</label>
              <input type="text" name="memo" value={formData.memo} onChange={handleChange} className="flight-input" placeholder="예: 몽생미셸 저녁식사" />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', padding: '14px' }}>지출 등록하기</button>
          </form>
        </div>

        {/* 정산 요약 및 차트 */}
        <div className="glass" style={{ padding: '2rem', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
          <h3 style={{ fontSize: '1.25rem', fontFamily: "'Cormorant Garamond', serif", color: 'var(--secondary)' }}>💡 진행 중인 정산 요약</h3>
          <div style={{ margin: '1.5rem 0', padding: '1.5rem', background: '#fdfbf7', borderRadius: '12px', border: '1px solid rgba(197, 160, 89, 0.3)' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>총 유로(EUR) 공동 지출</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--primary)', fontFamily: "'Cormorant Garamond', serif" }}>
              € {totalEur.toFixed(2)}
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.95rem', color: 'var(--text-main)', borderTop: '1px solid var(--border-color)', paddingTop: '0.8rem' }}>
              현재 1인당 부담금: <strong style={{color: 'var(--secondary)'}}>€ {perPersonAmount.toFixed(2)}</strong>
            </div>
          </div>

          <h4 style={{ marginBottom: '1.2rem', fontSize: '1.05rem', color: 'var(--secondary)' }}>개인별 정산 상태 (EUR)</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {users.map(user => {
              const paid = paidByUser[user.id] || 0;
              const balance = paid - perPersonAmount;
              return (
                <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.8rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)' }}>{user.name}</div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>결제함: €{paid.toFixed(2)}</div>
                    {balance > 0 ? (
                      <div style={{ color: '#10b981', fontWeight: 600, fontSize: '0.95rem' }}>+ €{Math.abs(balance).toFixed(2)} 받을 돈</div>
                    ) : balance < 0 ? (
                      <div style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.95rem' }}>- €{Math.abs(balance).toFixed(2)} 낼 돈</div>
                    ) : (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>정산 완료</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="glass" style={{ marginTop: '2rem', padding: '2rem', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
        <h3 style={{ fontSize: '1.25rem', fontFamily: "'Cormorant Garamond', serif", color: 'var(--secondary)', marginBottom: '1.5rem' }}>전체 지출 내역</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--secondary)' }}>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>날짜</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>분류</th>
                <th style={{ padding: '12px 10px', fontWeight: 600 }}>항목명</th>
                <th style={{ padding: '12px 10px', fontWeight: 600, textAlign: 'right' }}>금액</th>
                <th style={{ padding: '12px 10px', fontWeight: 600, textAlign: 'center' }}>결제자</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <tr key={record.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '14px 10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(record.date).toLocaleDateString()}</td>
                  <td style={{ padding: '14px 10px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(197, 160, 89, 0.1)', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}>{record.category}</span>
                  </td>
                  <td style={{ padding: '14px 10px', color: 'var(--text-main)' }}>{record.memo || '-'}</td>
                  <td style={{ padding: '14px 10px', fontWeight: 600, textAlign: 'right', color: 'var(--text-main)' }}>
                    {record.amount} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>{record.currency}</span>
                  </td>
                  <td style={{ padding: '14px 10px', color: 'var(--secondary)', textAlign: 'center', fontWeight: 500 }}>{record.payer_name}</td>
                </tr>
              ))}
              {records.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>등록된 지출 내역이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

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
        fetchData(); // 데이터 리로드
      } else {
        alert('추가 실패');
      }
    } catch (err) {
      alert('서버 오류');
    }
  };

  // 정산 계산 로직 (유로만 합산)
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
    <div>
      <h1 className="page-title">💶 여비 및 여행 가계부</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* 지출 입력 폼 */}
        <div className="glass" style={{ padding: '2rem' }}>
          <h3>새 지출 내역 입력</h3>
          <form onSubmit={handleAddSubmit} style={{ marginTop: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label>날짜</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} className="input-field" required />
              </div>
              <div>
                <label>분류</label>
                <select name="category" value={formData.category} onChange={handleChange} className="input-field">
                  <option value="식사">식사</option>
                  <option value="교통">교통 (렌터카, 주유, 톨게이트)</option>
                  <option value="숙소">숙소</option>
                  <option value="관광">관광 (입장료)</option>
                  <option value="쇼핑">쇼핑</option>
                  <option value="기타">기타</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label>금액</label>
                <input type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} className="input-field" required placeholder="예: 45.5" />
              </div>
              <div>
                <label>통화</label>
                <select name="currency" value={formData.currency} onChange={handleChange} className="input-field">
                  <option value="EUR">유로 (EUR)</option>
                  <option value="KRW">원 (KRW)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label>결제자 (누가 냈나요?)</label>
                <select name="payer_id" value={formData.payer_id} onChange={handleChange} className="input-field" required>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>내역 (메모)</label>
                <input type="text" name="memo" value={formData.memo} onChange={handleChange} className="input-field" placeholder="예: 몽생미셸 저녁식사" />
              </div>
            </div>

            <button type="submit" style={{ width: '100%' }}>등록하기</button>
          </form>
        </div>

        {/* 정산 요약 및 차트 */}
        <div className="glass" style={{ padding: '2rem' }}>
          <h3>💡 정산 요약 (유로 기준)</h3>
          <div style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>총 지출액</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
              € {totalEur.toFixed(2)}
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>
              1인당 부담금: <strong>€ {perPersonAmount.toFixed(2)}</strong>
            </div>
          </div>

          <h4 style={{ marginBottom: '1rem' }}>개인별 결제 금액 및 정산 상태</h4>
          <div>
            {users.map(user => {
              const paid = paidByUser[user.id] || 0;
              const balance = paid - perPersonAmount; // +면 받을 돈, -면 줄 돈
              return (
                <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontWeight: '500', fontSize: '1.1rem' }}>{user.name}</div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-muted)' }}>결제: €{paid.toFixed(2)}</div>
                    {balance > 0 ? (
                      <div style={{ color: '#10b981', fontWeight: 'bold' }}>+ €{Math.abs(balance).toFixed(2)} (받을 돈)</div>
                    ) : balance < 0 ? (
                      <div style={{ color: '#ef4444', fontWeight: 'bold' }}>- €{Math.abs(balance).toFixed(2)} (보낼 돈)</div>
                    ) : (
                      <div style={{ color: 'var(--text-muted)' }}>정산 완료 (-0)</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="glass" style={{ marginTop: '2rem', padding: '2rem' }}>
        <h3>지출 내역 리스트</h3>
        <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
              <th style={{ padding: '10px' }}>날짜</th>
              <th style={{ padding: '10px' }}>구분</th>
              <th style={{ padding: '10px' }}>내역</th>
              <th style={{ padding: '10px' }}>금액</th>
              <th style={{ padding: '10px' }}>결제자</th>
            </tr>
          </thead>
          <tbody>
            {records.map(record => (
              <tr key={record.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{new Date(record.date).toLocaleDateString()}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', fontSize: '0.85rem' }}>{record.category}</span>
                </td>
                <td style={{ padding: '10px' }}>{record.memo || '-'}</td>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>
                  {record.amount} {record.currency}
                </td>
                <td style={{ padding: '10px', color: 'var(--primary)' }}>{record.payer_name}</td>
              </tr>
            ))}
            {records.length === 0 && !loading && (
              <tr>
                <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>지출 내역이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

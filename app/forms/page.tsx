'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function FormsPage() {
  const [formData, setFormData] = useState({
    passportLastName: '',
    passportFirstName: '',
    passportNumber: '',
    passportExpiry: '',
    birthDate: '',
    emergencyContact: '',
    notes: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [existingPhoto, setExistingPhoto] = useState<string | null>(null);
  const [status, setStatus] = useState({ loading: false, success: false, error: '' });

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/members');
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === 'object') {
            setFormData({
              passportLastName: data.passport_last_name || '',
              passportFirstName: data.passport_first_name || '',
              passportNumber: data.passport_number || '',
              passportExpiry: data.passport_expiry ? data.passport_expiry.split('T')[0] : '',
              birthDate: data.birth_date ? data.birth_date.split('T')[0] : '',
              emergencyContact: data.emergency_contact || '',
              notes: data.notes || '',
            });
            if (data.photo_path) setExistingPhoto(data.photo_path);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedField = e.target.files[0];
      setFile(selectedField);
      setPreview(URL.createObjectURL(selectedField));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });

    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      submitData.append(key, value);
    });
    if (file) {
      submitData.append('passportPhoto', file);
    }

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        body: submitData,
      });

      if (res.ok) {
        setStatus({ loading: false, success: true, error: '' });
        alert('저장되었습니다.');
      } else {
        const d = await res.json();
        setStatus({ loading: false, success: false, error: d.error || '저장 실패' });
      }
    } catch (err) {
      setStatus({ loading: false, success: false, error: '서버 오류' });
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      <h1 className="page-title">📝 여행자 정보 안전 관리</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: 1.6 }}>항공권 발권 및 현지 렌터카 예약을 위해 정확한 여권 정보를 제출해 주세요.</p>

      <form onSubmit={handleSubmit} className="glass" style={{ padding: '2rem', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
        
        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--secondary)', marginBottom: '0.5rem' }}>1. 여권 사본 업로드</h3>
          {existingPhoto && !preview && (
             <div style={{ marginBottom: '1rem', background: '#fdfbf7', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(197, 160, 89, 0.2)' }}>
               <p style={{ color: 'var(--primary)', marginBottom: '0.8rem', fontSize: '0.9rem', fontWeight: 600 }}>✅ 현재 업로드되어 있는 여권 사본</p>
               <Image src={existingPhoto} alt="여권" width={300} height={200} style={{ objectFit: 'contain', borderRadius: '8px' }} />
             </div>
          )}
          {preview && (
            <div style={{ marginBottom: '1rem', background: 'rgba(16, 185, 129, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <p style={{ color: '#10b981', marginBottom: '0.8rem', fontSize: '0.9rem', fontWeight: 600 }}>✅ 새로 선택한 이미지 미리보기</p>
              <Image src={preview} alt="미리보기" width={300} height={200} style={{ objectFit: 'contain', borderRadius: '8px' }} />
            </div>
          )}
          <input type="file" accept="image/jpeg, image/png, application/pdf" onChange={handleFileChange} className="flight-input" style={{ marginBottom: 0 }} />
          <small style={{ color: 'var(--text-muted)' }}>* JPG, PNG 파일 형식 (최대 5MB, 빛반사 없이 선명하게)</small>
        </div>

        <h3 style={{ fontSize: '1.15rem', color: 'var(--secondary)', marginBottom: '1.5rem' }}>2. 여권 세부 정보 입력</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>영문 성 (Last Name) *</label>
            <input type="text" name="passportLastName" value={formData.passportLastName} onChange={handleChange} className="flight-input" required placeholder="예: HONG" style={{ textTransform: 'uppercase' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>영문 이름 (First Name) *</label>
            <input type="text" name="passportFirstName" value={formData.passportFirstName} onChange={handleChange} className="flight-input" required placeholder="예: GILDONG" style={{ textTransform: 'uppercase' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>여권 번호 *</label>
            <input type="text" name="passportNumber" value={formData.passportNumber} onChange={handleChange} className="flight-input" required placeholder="예: M12345678" style={{ textTransform: 'uppercase' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>여권 만료일 *</label>
            <input type="date" name="passportExpiry" value={formData.passportExpiry} onChange={handleChange} className="flight-input" required />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>생년월일 *</label>
            <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="flight-input" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>비상 연락처 (한국 내 가족/지인) *</label>
            <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} className="flight-input" required placeholder="예: 010-1234-5678" />
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--secondary)', marginBottom: '1rem' }}>3. 기타 특이사항 (선택)</h3>
          <textarea name="notes" value={formData.notes} onChange={handleChange} className="flight-input" rows={4} placeholder="비행기 식사 알레르기, 건강상 주의가 필요한 부분이 있다면 알려주세요." style={{ resize: 'none' }}></textarea>
        </div>

        {status.error && <div style={{ color: '#ef4444', marginBottom: '1rem', fontWeight: 500, padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>❌ {status.error}</div>}
        {status.success && <div style={{ color: '#10b981', marginBottom: '1rem', fontWeight: 500, padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>✅ 안전하게 저장되었습니다.</div>}

        <button type="submit" disabled={status.loading} className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}>
          {status.loading ? '저장 중...' : '정보 저장하기'}
        </button>
      </form>
    </div>
  );
}

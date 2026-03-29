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
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="page-title">📝 여행자 정보 입력</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>원활한 렌터카 및 항공 투어를 위해 정확한 여권 정보를 입력해주세요.</p>

      <form onSubmit={handleSubmit} className="glass" style={{ padding: '2rem' }}>
        
        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', marginBottom: '1.5rem' }}>
          <h3>여권 사본 업로드</h3>
          {existingPhoto && !preview && (
             <div style={{ marginBottom: '1rem' }}>
               <p style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>현재 저장된 여권 사진:</p>
               <Image src={existingPhoto} alt="여권" width={300} height={200} style={{ objectFit: 'contain', borderRadius: '8px' }} />
             </div>
          )}
          {preview && (
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ color: '#10b981', marginBottom: '0.5rem' }}>새로 업로드할 사진 미리보기:</p>
              <Image src={preview} alt="미리보기" width={300} height={200} style={{ objectFit: 'contain', borderRadius: '8px' }} />
            </div>
          )}
          <input type="file" accept="image/jpeg, image/png, application/pdf" onChange={handleFileChange} className="input-field" style={{ marginBottom: 0 }} />
          <small style={{ color: 'var(--text-muted)' }}>* JPG, PNG 파일 형식 (최대 5MB)</small>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label>영문 성 (Last Name) *</label>
            <input type="text" name="passportLastName" value={formData.passportLastName} onChange={handleChange} className="input-field" required placeholder="예: HONG" style={{ textTransform: 'uppercase' }} />
          </div>
          <div>
            <label>영문 이름 (First Name) *</label>
            <input type="text" name="passportFirstName" value={formData.passportFirstName} onChange={handleChange} className="input-field" required placeholder="예: GILDONG" style={{ textTransform: 'uppercase' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label>여권 번호 *</label>
            <input type="text" name="passportNumber" value={formData.passportNumber} onChange={handleChange} className="input-field" required placeholder="예: M12345678" style={{ textTransform: 'uppercase' }} />
          </div>
          <div>
            <label>여권 만료일 *</label>
            <input type="date" name="passportExpiry" value={formData.passportExpiry} onChange={handleChange} className="input-field" required />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label>생년월일 *</label>
            <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="input-field" required />
          </div>
          <div>
            <label>비상 연락처 (한국) *</label>
            <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} className="input-field" required placeholder="예: 010-1234-5678 (가족)" />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label>특이사항 (건강상태, 알레르기 등)</label>
          <textarea name="notes" value={formData.notes} onChange={handleChange} className="input-field" rows={4} placeholder="해당사항이 있다면 작성해주세요." style={{ resize: 'none' }}></textarea>
        </div>

        {status.error && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{status.error}</div>}
        {status.success && <div style={{ color: '#10b981', marginBottom: '1rem' }}>저장되었습니다.</div>}

        <button type="submit" disabled={status.loading} style={{ width: '100%', fontSize: '1.1rem' }}>
          {status.loading ? '저장 중...' : '정보 저장하기'}
        </button>
      </form>
    </div>
  );
}

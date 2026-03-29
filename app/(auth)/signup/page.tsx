'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    password: '',
    passwordConfirm: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          name: formData.name,
          password: formData.password
        }),
      });

      if (res.ok) {
        alert('회원가입이 완료되었습니다. 로그인해주세요.');
        router.push('/');
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch (err) {
      setError('회원가입 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="glass" style={{ padding: '3rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h1 className="page-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>회원가입</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>멤버 멤버 정보를 등록해주세요.</p>

        {error && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleSignup}>
          <input 
            type="text" 
            name="username"
            placeholder="아이디 (로그인용)" 
            className="input-field" 
            style={{ marginBottom: '10px' }}
            value={formData.username}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <input 
            type="text" 
            name="name"
            placeholder="실명 (예: 김철수)" 
            className="input-field" 
            style={{ marginBottom: '10px' }}
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <input 
            type="password" 
            name="password"
            placeholder="비밀번호" 
            className="input-field" 
            style={{ marginBottom: '10px' }}
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <input 
            type="password" 
            name="passwordConfirm"
            placeholder="비밀번호 확인" 
            className="input-field" 
            style={{ marginBottom: '20px' }}
            value={formData.passwordConfirm}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <button type="submit" style={{ width: '100%', marginBottom: '1rem' }} disabled={isLoading}>
            {isLoading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
          이미 계정이 있으신가요? <Link href="/" style={{ color: 'var(--primary)' }}>로그인</Link>
        </div>
      </div>
    </div>
  );
}

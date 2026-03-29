import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { username, name, password } = await request.json();

    if (!username || !name || !password) {
      return NextResponse.json({ error: '모든 필드를 입력해주세요.' }, { status: 400 });
    }

    // 아이디 중복 확인
    const existingUser = await query('SELECT id FROM users WHERE username = $1', [username]);
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: '이미 사용 중인 아이디입니다.' }, { status: 400 });
    }

    // 비밀번호 해싱
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 첫 번째 가입자인 경우 관리자 권한 부여
    const userCount = await query('SELECT count(*) FROM users');
    const isAdmin = parseInt(userCount.rows[0].count) === 0;

    await query(
      'INSERT INTO users (username, name, password_hash, is_admin) VALUES ($1, $2, $3, $4)',
      [username, name, hashedPassword, isAdmin]
    );

    return NextResponse.json({ message: '회원가입 성공!' }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

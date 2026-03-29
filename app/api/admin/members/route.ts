import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const user = await getSession();
  
  // 최초 가입자인 neohum 에게만 허용
  if (!user || user.username !== 'neohum') {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  try {
    const res = await query(`
      SELECT m.*, u.name as user_name 
      FROM member_info m
      JOIN users u ON m.user_id = u.id
      ORDER BY m.id ASC
    `);
    
    return NextResponse.json(res.rows);
  } catch (err) {
    console.error('Admin members error:', err);
    return NextResponse.json({ error: '조회 실패' }, { status: 500 });
  }
}

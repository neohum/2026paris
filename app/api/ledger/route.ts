import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  try {
    const res = await query(`
      SELECT l.*, u.name as payer_name 
      FROM ledger l
      LEFT JOIN users u ON l.payer_id = u.id
      ORDER BY l.date DESC, l.id DESC
    `);
    
    // 유저 리스트도 같이 반환 (정산을 위해)
    const usersRes = await query('SELECT id, name FROM users');
    
    return NextResponse.json({
      records: res.rows,
      users: usersRes.rows
    });
  } catch (err) {
    return NextResponse.json({ error: '가계부 로드 실패' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  try {
    const { date, category, amount, currency, payer_id, memo } = await request.json();

    await query(`
      INSERT INTO ledger (date, category, amount, currency, payer_id, memo, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [date, category, amount, currency, payer_id, memo, user.id]);

    return NextResponse.json({ message: '지출 등록 완료' }, { status: 201 });
  } catch (err) {
    console.error('Ledger insert error:', err);
    return NextResponse.json({ error: '지출 등록 실패' }, { status: 500 });
  }
}

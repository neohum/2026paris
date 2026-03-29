import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    const userId = session?.id || null;

    // 투표 집계
    const statsRes = await query(`
      SELECT option_id, COUNT(*) as count 
      FROM paris_votes 
      GROUP BY option_id
    `);
    
    const counts = { 1: 0, 2: 0, 3: 0 };
    statsRes.rows.forEach((row: any) => {
      counts[row.option_id as keyof typeof counts] = parseInt(row.count, 10);
    });

    let currentVote = null;
    if (userId) {
      const myVoteRes = await query('SELECT option_id FROM paris_votes WHERE user_id = $1', [userId]);
      if (myVoteRes.rows.length > 0) {
        currentVote = myVoteRes.rows[0].option_id;
      }
    }

    return NextResponse.json({ counts, currentVote });
  } catch (error) {
    console.error('Fetch votes error:', error);
    return NextResponse.json({ error: '투표 데이터를 불러오지 못했습니다.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { optionId } = await req.json();
    if (![1, 2, 3].includes(optionId)) {
      return NextResponse.json({ error: '유효하지 않은 옵션입니다.' }, { status: 400 });
    }

    // UPSERT 구문
    await query(`
      INSERT INTO paris_votes (user_id, option_id) 
      VALUES ($1, $2) 
      ON CONFLICT (user_id) 
      DO UPDATE SET option_id = $2, created_at = CURRENT_TIMESTAMP
    `, [session.id, optionId]);

    return NextResponse.json({ success: true, message: '투표가 반영되었습니다.' });
  } catch (error) {
    console.error('Submit vote error:', error);
    return NextResponse.json({ error: '투표 처리에 실패했습니다.' }, { status: 500 });
  }
}

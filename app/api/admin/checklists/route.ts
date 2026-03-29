import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const res = await query('SELECT * FROM admin_checklists ORDER BY created_at ASC', []);
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Error fetching admin checklists:', error);
    return NextResponse.json({ error: 'Failed to fetch admin checklists' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.username !== 'neohum') {
      return NextResponse.json({ error: '관리자 권한이 없습니다.' }, { status: 403 });
    }

    const { label, description, is_provided_by_admin } = await req.json();
    if (!label) {
      return NextResponse.json({ error: '항목 이름이 필요합니다.' }, { status: 400 });
    }

    const res = await query(
      `INSERT INTO admin_checklists (label, description, is_provided_by_admin) 
       VALUES ($1, $2, $3) RETURNING *`,
      [label, description || '', is_provided_by_admin || false]
    );

    return NextResponse.json({ success: true, item: res.rows[0] });
  } catch (error) {
    console.error('Add admin checklist error:', error);
    return NextResponse.json({ error: '항목 추가에 실패했습니다.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.username !== 'neohum') {
      return NextResponse.json({ error: '관리자 권한이 없습니다.' }, { status: 403 });
    }

    const { id } = await params;
    
    await query('DELETE FROM admin_checklists WHERE id = $1', [parseInt(id)]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete admin checklist error:', error);
    return NextResponse.json({ error: '항목 삭제에 실패했습니다.' }, { status: 500 });
  }
}

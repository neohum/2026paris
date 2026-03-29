import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    
    const user = await getSession();
    if (!user) return new NextResponse('인증 필요', { status: 401 });
    if (user.id !== parseInt(userId) && user.username !== 'neohum') {
      return new NextResponse('권한 없음', { status: 403 });
    }

    const res = await query('SELECT photo_data, photo_mime FROM member_photos WHERE user_id = $1', [userId]);
    
    if (res.rows.length === 0) {
      return new NextResponse('Not found', { status: 404 });
    }

    const { photo_data, photo_mime } = res.rows[0];
    
    return new NextResponse(photo_data, {
      status: 200,
      headers: {
        'Content-Type': photo_mime || 'application/octet-stream',
        'Cache-Control': 'private, max-age=3600'
      }
    });

  } catch (err) {
    console.error('Fetch photo error', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

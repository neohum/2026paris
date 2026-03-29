import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await req.json();
    const { courseId, name, description, lat, lng, placeType, dayNumber, visitDate } = body;

    if (!courseId || !name || lat === undefined || lng === undefined || !placeType) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 });
    }

    // 기본 활동은 타입에 따라 설정
    let activities = '자유 추천 장소';
    if (placeType === 'accommodation') {
      activities = '숙소 숙박 및 휴식';
    }

    // 기존 장소들 중 가장 큰 place_order 찾아서 + 1
    const orderRes = await query(
      'SELECT COALESCE(MAX(place_order), 0) + 1 as next_order FROM course_places WHERE course_id = $1 AND day_number = $2',
      [courseId, dayNumber || 1]
    );
    const placeOrder = orderRes.rows[0].next_order;

    await query(
      `INSERT INTO course_places 
       (course_id, name, description, lat, lng, visit_date, day_number, place_order, activities, place_type) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        courseId, 
        name, 
        description || '', 
        lat, 
        lng, 
        visitDate || null, 
        dayNumber || 1, 
        placeOrder, 
        activities, 
        placeType
      ]
    );

    return NextResponse.json({ success: true, message: '장소가 성공적으로 추가되었습니다.' });
  } catch (error) {
    console.error('Add course place error:', error);
    return NextResponse.json({ error: '장소 추가에 실패했습니다.' }, { status: 500 });
  }
}

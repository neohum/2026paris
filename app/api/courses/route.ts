import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const coursesRes = await query('SELECT * FROM courses ORDER BY id ASC');
    const courses = coursesRes.rows;

    const placesRes = await query('SELECT * FROM course_places ORDER BY day_number ASC, place_order ASC');
    const places = placesRes.rows;

    // 코스별 장소 매핑
    const data = courses.map(course => ({
      ...course,
      places: places.filter(place => place.course_id === course.id)
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Fetch courses error:', error);
    return NextResponse.json({ error: '데이터를 불러오지 못했습니다.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    const userId = session?.id || 0; // 0 means unauthenticated

    const text = `
      SELECT 
        fr.*,
        u.name as user_name,
        u.username as user_username,
        (SELECT COUNT(*) FROM flight_votes fv WHERE fv.flight_id = fr.id) as vote_count,
        EXISTS(SELECT 1 FROM flight_votes fv WHERE fv.flight_id = fr.id AND fv.user_id = $1) as has_voted
      FROM flight_recommendations fr
      JOIN users u ON fr.user_id = u.id
      ORDER BY vote_count DESC, fr.created_at DESC
    `;
    const result = await query(text, [userId]);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching flight recommendations:', error);
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: 'You must be logged in to recommend a flight.' }, { status: 401 });
    }

    const { departureDate, returnDate, airline, route, price, duration, memo } = await req.json();

    if (!departureDate || !returnDate || !airline || !route || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const text = `
      INSERT INTO flight_recommendations 
        (user_id, departure_date, return_date, airline, route, price, duration, memo)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [session.id, departureDate, returnDate, airline, route, price, duration || '', memo || ''];
    const result = await query(text, values);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error adding flight recommendation:', error);
    return NextResponse.json({ error: 'Failed to add recommendation' }, { status: 500 });
  }
}

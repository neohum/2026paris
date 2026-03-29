import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: 'You must be logged in to vote.' }, { status: 401 });
    }

    const { flightId } = await req.json();

    if (!flightId) {
      return NextResponse.json({ error: 'flightId is required' }, { status: 400 });
    }

    const userId = session.id;

    // Check if user already voted
    const checkVote = await query(
      'SELECT id FROM flight_votes WHERE user_id = $1 AND flight_id = $2',
      [userId, flightId]
    );

    if (checkVote.rows.length > 0) {
      // Unvote
      await query(
        'DELETE FROM flight_votes WHERE user_id = $1 AND flight_id = $2',
        [userId, flightId]
      );
      
      const newVotesRes = await query(
        'SELECT COUNT(*) as vote_count FROM flight_votes WHERE flight_id = $1',
        [flightId]
      );
      const newVotes = parseInt(newVotesRes.rows[0].vote_count, 10);

      return NextResponse.json({ message: 'Vote removed', flightId, vote_count: newVotes, has_voted: false });
    } else {
      // Vote
      await query(
        'INSERT INTO flight_votes (user_id, flight_id) VALUES ($1, $2)',
        [userId, flightId]
      );

      const newVotesRes = await query(
        'SELECT COUNT(*) as vote_count FROM flight_votes WHERE flight_id = $1',
        [flightId]
      );
      const newVotes = parseInt(newVotesRes.rows[0].vote_count, 10);

      return NextResponse.json({ message: 'Vote added', flightId, vote_count: newVotes, has_voted: true });
    }
  } catch (error) {
    console.error('Error handling flight vote:', error);
    return NextResponse.json({ error: 'Failed to process vote' }, { status: 500 });
  }
}

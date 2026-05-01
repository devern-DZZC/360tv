// GET /api/streams — Fetch streams with filtering & pagination
import { type NextRequest } from 'next/server';
import { getStreams, getStreamCounts } from '@/lib/services/stream-service';
import type { StreamStatus, Sport } from '@/lib/types';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['LIVE', 'UPCOMING', 'PAST', 'CANCELLED', 'all'];
const VALID_SPORTS = ['CRICKET', 'FOOTBALL', 'UNKNOWN', 'all'];
const VALID_SORTS = ['newest', 'oldest', 'starting_soon'];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse & validate params
    const statusParam = (searchParams.get('status') || 'all').toUpperCase();
    const sportParam = (searchParams.get('sport') || 'all').toUpperCase();
    const limitParam = parseInt(searchParams.get('limit') || '12', 10);
    const cursor = searchParams.get('cursor') || undefined;
    const sortParam = searchParams.get('sort') || undefined;

    const status = VALID_STATUSES.includes(statusParam)
      ? (statusParam.toLowerCase() === 'all' ? 'all' : statusParam as StreamStatus)
      : 'all';

    const sport = VALID_SPORTS.includes(sportParam)
      ? (sportParam.toLowerCase() === 'all' ? 'all' : sportParam as Sport)
      : 'all';

    const sort = sortParam && VALID_SORTS.includes(sortParam)
      ? sortParam as 'newest' | 'oldest' | 'starting_soon'
      : undefined;

    const limit = isNaN(limitParam) ? 12 : Math.min(Math.max(limitParam, 1), 50);

    const [result, counts] = await Promise.all([
      getStreams({ status, sport, limit, cursor, sort }),
      getStreamCounts(),
    ]);

    return Response.json({
      data: result.data,
      meta: result.meta,
      counts,
    });
  } catch (error) {
    console.error('[API] GET /api/streams error:', error);
    return Response.json(
      { error: 'Failed to fetch streams' },
      { status: 500 }
    );
  }
}

// GET /api/streams/counts — Lightweight status counts
import { getStreamCounts } from '@/lib/services/stream-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const counts = await getStreamCounts();
    return Response.json(counts);
  } catch (error) {
    console.error('[API] GET /api/streams/counts error:', error);
    return Response.json(
      { error: 'Failed to fetch counts' },
      { status: 500 }
    );
  }
}

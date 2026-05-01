// GET /api/streams/[id] — Fetch a single stream by ID
import { type NextRequest } from 'next/server';
import { getStreamById } from '@/lib/services/stream-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stream = await getStreamById(id);

    if (!stream) {
      return Response.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }

    return Response.json({ data: stream });
  } catch (error) {
    console.error('[API] GET /api/streams/[id] error:', error);
    return Response.json(
      { error: 'Failed to fetch stream' },
      { status: 500 }
    );
  }
}

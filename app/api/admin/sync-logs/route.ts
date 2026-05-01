// GET /api/admin/sync-logs — Retrieve sync history
import { type NextRequest } from 'next/server';
import { getSyncLogs } from '@/lib/services/sync-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Verify admin secret
  const adminSecret = request.headers.get('x-admin-secret');

  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const limitParam = request.nextUrl.searchParams.get('limit');
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : 20;

    const logs = await getSyncLogs(limit);
    return Response.json({ data: logs });
  } catch (error) {
    console.error('[ADMIN] Fetch sync logs error:', error);
    return Response.json(
      { error: 'Failed to fetch sync logs' },
      { status: 500 }
    );
  }
}

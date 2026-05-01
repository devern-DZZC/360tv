// POST /api/admin/sync — Manual sync trigger
import { type NextRequest } from 'next/server';
import { runSync } from '@/lib/services/sync-service';
import { revalidateTag, revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  // Verify admin secret
  const adminSecret = request.headers.get('x-admin-secret');

  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const result = await runSync({ trigger: 'MANUAL' });

    // Invalidate cached stream data and the static homepage
    revalidateTag('streams', 'max');
    revalidatePath('/');

    return Response.json(result);
  } catch (error) {
    console.error('[ADMIN] Manual sync failed:', error);
    return Response.json(
      {
        error: 'Sync failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET /api/cron/sync-youtube — Triggered by Vercel Cron
import { type NextRequest } from 'next/server';
import { runSync } from '@/lib/services/sync-service';
import { revalidateTag, revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60s for sync

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const result = await runSync({ trigger: 'CRON' });

    // Invalidate cached stream data and the static homepage
    revalidateTag('streams', 'max');
    revalidatePath('/');

    return Response.json(result);
  } catch (error) {
    console.error('[CRON] Sync failed:', error);
    return Response.json(
      {
        error: 'Sync failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET /api/cron/check-rss — Triggered by Vercel Cron or External Cron
import { type NextRequest } from 'next/server';
import { runSync, detectFeedChanges } from '@/lib/services/sync-service';
import { revalidateTag, revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60s if full sync is triggered

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

  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  if (!channelId) {
    return Response.json({ error: 'YOUTUBE_CHANNEL_ID not set' }, { status: 500 });
  }

  try {
    console.log('[CRON] Checking YouTube RSS feed for changes...');
    
    // First, check for changes without spending API quota
    const { changed, reason } = await detectFeedChanges(channelId);
    
    if (!changed) {
      console.log('[CRON] No changes detected in RSS feed. Skipping API sync.');
      return Response.json({ 
        success: true, 
        skipped: true, 
        mode: 'rss', 
        reason 
      });
    }

    console.log(`[CRON] Changes detected (${reason}). Triggering full sync...`);
    
    // Changes detected! Spend YouTube Quota points to pull exact details.
    const result = await runSync({ trigger: 'CRON_RSS' });

    // Invalidate cached stream data and the static homepage
    revalidateTag('streams', 'max');
    revalidatePath('/');

    return Response.json({
      ...result,
      rssTriggerReason: reason,
    });
  } catch (error) {
    console.error('[CRON] RSS Check/Sync failed:', error);
    return Response.json(
      {
        error: 'Sync failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

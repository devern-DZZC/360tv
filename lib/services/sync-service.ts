// ============================================================
// 360tv — Sync Service
// Orchestrates the full YouTube → Database sync pipeline.
// ============================================================

import { prisma } from '@/lib/prisma';
import {
  getChannelUploadsPlaylistId,
  getPlaylistVideoIds,
  batchGetVideoDetails,
  searchBroadcasts,
  getSessionQuotaUsed,
  resetSessionQuota,
} from '@/lib/services/youtube-service';
import { classifyStream } from '@/lib/classification';
import { detectSport } from '@/lib/sport-detection';
import { SYNC_LOCK_TIMEOUT_MINUTES } from '@/lib/constants';
import type { YouTubeVideoResource, SyncTrigger } from '@/lib/types';
import { sleep } from '@/lib/utils';

interface SyncOptions {
  trigger: SyncTrigger;
  channelId?: string;
}

/**
 * Run the full sync pipeline.
 * 1. Check for existing running syncs (concurrency guard)
 * 2. Create a SyncLog entry
 * 3. Fetch uploads playlist → video IDs → video details
 * 4. Supplementary search for upcoming/live broadcasts
 * 5. Classify and upsert each video
 * 6. Update SyncLog with results
 */
export async function runSync(options: SyncOptions) {
  const { trigger } = options;
  const channelId = options.channelId || process.env.YOUTUBE_CHANNEL_ID;

  if (!channelId) {
    throw new Error('YOUTUBE_CHANNEL_ID environment variable is not set');
  }

  // --- Concurrency Guard ---
  const lockCutoff = new Date(Date.now() - SYNC_LOCK_TIMEOUT_MINUTES * 60 * 1000);
  const runningSync = await prisma.syncLog.findFirst({
    where: {
      status: 'RUNNING',
      startedAt: { gt: lockCutoff },
    },
  });

  if (runningSync) {
    console.log(`Sync skipped: another sync is already running (id: ${runningSync.id})`);
    return {
      success: true,
      skipped: true,
      reason: 'Sync already in progress',
    };
  }

  // Mark any stale RUNNING syncs as FAILED
  await prisma.syncLog.updateMany({
    where: {
      status: 'RUNNING',
      startedAt: { lt: lockCutoff },
    },
    data: {
      status: 'FAILED',
      errorDetails: 'Marked as failed: exceeded lock timeout',
    },
  });

  // --- Create SyncLog ---
  const syncLog = await prisma.syncLog.create({
    data: { trigger, status: 'RUNNING' },
  });

  const startTime = Date.now();
  resetSessionQuota();

  let totalFetched = 0;
  let totalUpserted = 0;
  let totalErrors = 0;
  const errorDetails: string[] = [];

  try {
    // --- Step 1: Get uploads playlist ---
    console.log(`[Sync] Fetching uploads playlist for channel: ${channelId}`);
    const uploadsPlaylistId = await getChannelUploadsPlaylistId(channelId);
    console.log(`[Sync] Uploads playlist: ${uploadsPlaylistId}`);

    // --- Step 2: Get video IDs from playlist ---
    console.log(`[Sync] Fetching video IDs from playlist...`);
    const playlistVideoIds = await getPlaylistVideoIds(uploadsPlaylistId);
    console.log(`[Sync] Found ${playlistVideoIds.length} videos in playlist`);

    // --- Step 3: Supplementary search for upcoming/live ---
    console.log(`[Sync] Searching for upcoming broadcasts...`);
    let supplementaryIds: string[] = [];
    try {
      const upcomingIds = await searchBroadcasts(channelId, 'upcoming');
      await sleep(100);
      const liveIds = await searchBroadcasts(channelId, 'live');
      supplementaryIds = [...new Set([...upcomingIds, ...liveIds])];
      console.log(`[Sync] Found ${supplementaryIds.length} supplementary broadcasts`);
    } catch (error) {
      // Non-fatal: supplementary search failure shouldn't kill the sync
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`[Sync] Supplementary search failed: ${msg}`);
      errorDetails.push(`Supplementary search failed: ${msg}`);
    }

    // --- Step 4: Merge and deduplicate video IDs ---
    const allVideoIds = [...new Set([...playlistVideoIds, ...supplementaryIds])];
    console.log(`[Sync] Total unique video IDs: ${allVideoIds.length}`);

    // --- Step 5: Batch fetch video details ---
    console.log(`[Sync] Fetching video details...`);
    const videos = await batchGetVideoDetails(allVideoIds);
    totalFetched = videos.length;
    console.log(`[Sync] Fetched details for ${totalFetched} videos`);

    // --- Step 6: Process each video ---
    for (const video of videos) {
      try {
        const result = processVideo(video);
        if (result) {
          await prisma.stream.upsert({
            where: { youtubeVideoId: video.id },
            create: result,
            update: {
              ...result,
              youtubeVideoId: undefined, // Don't update the unique key
            },
          });
          totalUpserted++;
        }
      } catch (error) {
        totalErrors++;
        const msg = error instanceof Error ? error.message : String(error);
        errorDetails.push(`Video ${video.id}: ${msg}`);
        console.error(`[Sync] Error processing video ${video.id}: ${msg}`);
      }
    }

    // --- Re-evaluate existing streams that might have transitioned ---
    // Check existing LIVE/UPCOMING streams not in this fetch (might have ended)
    await reEvaluateExistingStreams(allVideoIds);

    // --- Update SyncLog ---
    const durationMs = Date.now() - startTime;
    const status = totalErrors > 0 && totalUpserted > 0 ? 'PARTIAL' : totalErrors > 0 ? 'FAILED' : 'COMPLETED';

    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status,
        completedAt: new Date(),
        totalFetched,
        totalUpserted,
        totalErrors,
        errorDetails: errorDetails.length > 0 ? JSON.stringify(errorDetails) : null,
        durationMs,
        quotaUsed: getSessionQuotaUsed(),
      },
    });

    console.log(`[Sync] Complete: ${totalUpserted} upserted, ${totalErrors} errors, ${durationMs}ms, ${getSessionQuotaUsed()} quota`);

    return {
      success: true,
      skipped: false,
      summary: {
        totalFetched,
        totalUpserted,
        totalErrors,
        durationMs,
        quotaUsed: getSessionQuotaUsed(),
      },
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const msg = error instanceof Error ? error.message : String(error);

    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        totalFetched,
        totalUpserted,
        totalErrors,
        errorDetails: JSON.stringify([...errorDetails, `Fatal: ${msg}`]),
        durationMs,
        quotaUsed: getSessionQuotaUsed(),
      },
    });

    console.error(`[Sync] Failed: ${msg}`);
    throw error;
  }
}

/**
 * Process a single YouTube video into a database record.
 * Returns null if the video should be skipped (not a broadcast).
 */
function processVideo(video: YouTubeVideoResource) {
  const { snippet, liveStreamingDetails, contentDetails, statistics } = video;

  // Classify the stream
  const classification = classifyStream({
    liveBroadcastContent: snippet.liveBroadcastContent,
    scheduledStartTime: liveStreamingDetails?.scheduledStartTime,
    actualStartTime: liveStreamingDetails?.actualStartTime,
    actualEndTime: liveStreamingDetails?.actualEndTime,
  });

  if (classification.skip) {
    return null;
  }

  // Detect sport
  const sport = detectSport(snippet.title, snippet.description);

  // Pick best thumbnail
  const thumbnails = snippet.thumbnails;
  const thumbnailUrl = thumbnails.medium?.url || thumbnails.default?.url || '';
  const thumbnailHigh = thumbnails.maxres?.url || thumbnails.high?.url || thumbnails.standard?.url || null;

  return {
    youtubeVideoId: video.id,
    title: snippet.title,
    description: snippet.description || null,
    thumbnailUrl,
    thumbnailHigh,
    channelId: snippet.channelId,
    channelTitle: snippet.channelTitle,
    status: classification.status!,
    sport,
    scheduledStartTime: liveStreamingDetails?.scheduledStartTime
      ? new Date(liveStreamingDetails.scheduledStartTime)
      : null,
    actualStartTime: liveStreamingDetails?.actualStartTime
      ? new Date(liveStreamingDetails.actualStartTime)
      : null,
    actualEndTime: liveStreamingDetails?.actualEndTime
      ? new Date(liveStreamingDetails.actualEndTime)
      : null,
    liveBroadcastContent: snippet.liveBroadcastContent || null,
    duration: contentDetails?.duration || null,
    viewCount: statistics?.viewCount ? parseInt(statistics.viewCount, 10) : null,
    likeCount: statistics?.likeCount ? parseInt(statistics.likeCount, 10) : null,
    concurrentViewers: liveStreamingDetails?.concurrentViewers
      ? parseInt(liveStreamingDetails.concurrentViewers, 10)
      : null,
    lastSyncedAt: new Date(),
  };
}

/**
 * Re-evaluate existing LIVE/UPCOMING streams that weren't in the current fetch.
 * This handles cases where a stream may have ended or been removed.
 */
async function reEvaluateExistingStreams(fetchedVideoIds: string[]) {
  // Find active streams not in the current fetch set
  const activeStreams = await prisma.stream.findMany({
    where: {
      status: { in: ['LIVE', 'UPCOMING'] },
      youtubeVideoId: { notIn: fetchedVideoIds },
    },
  });

  for (const stream of activeStreams) {
    // If a LIVE stream wasn't in the fetch, it likely ended
    if (stream.status === 'LIVE') {
      await prisma.stream.update({
        where: { id: stream.id },
        data: {
          status: 'PAST',
          actualEndTime: new Date(),
          lastSyncedAt: new Date(),
        },
      });
      console.log(`[Sync] Transitioned missing LIVE stream to PAST: ${stream.title}`);
    }

    // Re-run classification for UPCOMING streams
    if (stream.status === 'UPCOMING') {
      const result = classifyStream({
        liveBroadcastContent: stream.liveBroadcastContent,
        scheduledStartTime: stream.scheduledStartTime,
        actualStartTime: stream.actualStartTime,
        actualEndTime: stream.actualEndTime,
      });

      if (!result.skip && result.status !== stream.status) {
        await prisma.stream.update({
          where: { id: stream.id },
          data: {
            status: result.status!,
            lastSyncedAt: new Date(),
          },
        });
        console.log(`[Sync] Re-classified stream: ${stream.title} → ${result.status}`);
      }
    }
  }
}

/**
 * Get recent sync logs.
 */
export async function getSyncLogs(limit = 20) {
  return prisma.syncLog.findMany({
    orderBy: { startedAt: 'desc' },
    take: limit,
  });
}

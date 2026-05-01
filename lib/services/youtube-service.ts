// ============================================================
// 360tv — YouTube API Service
// Handles all communication with YouTube Data API v3.
// Encapsulates key management, request construction,
// pagination, retries, and error handling.
// ============================================================

import type {
  YouTubeVideoResource,
  YouTubePlaylistItemResource,
  YouTubeSearchResult,
  YouTubeListResponse,
} from '@/lib/types';
import {
  YOUTUBE_API_BASE,
  YOUTUBE_MAX_RESULTS,
  YOUTUBE_API_RETRY_COUNT,
  YOUTUBE_API_RETRY_DELAY_MS,
  YOUTUBE_API_CALL_DELAY_MS,
  YOUTUBE_API_TIMEOUT_MS,
} from '@/lib/constants';
import { sleep } from '@/lib/utils';

// Track quota usage per sync session
let sessionQuotaUsed = 0;

export function getSessionQuotaUsed(): number {
  return sessionQuotaUsed;
}

export function resetSessionQuota(): void {
  sessionQuotaUsed = 0;
}

function getApiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error('YOUTUBE_API_KEY environment variable is not set');
  return key;
}

/**
 * Make an authenticated YouTube API request with retry logic.
 */
async function ytFetch<T>(
  endpoint: string,
  params: Record<string, string>,
  quotaCost: number
): Promise<T> {
  const url = new URL(`${YOUTUBE_API_BASE}/${endpoint}`);
  url.searchParams.set('key', getApiKey());
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < YOUTUBE_API_RETRY_COUNT; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), YOUTUBE_API_TIMEOUT_MS);

      const response = await fetch(url.toString(), {
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeout);

      if (response.status === 403) {
        const body = await response.json();
        const reason = body?.error?.errors?.[0]?.reason;
        if (reason === 'quotaExceeded') {
          throw new Error(`YouTube API quota exceeded`);
        }
        if (reason === 'forbidden' || reason === 'keyInvalid') {
          throw new Error(`YouTube API auth error: ${reason}`);
        }
      }

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }

      sessionQuotaUsed += quotaCost;
      return (await response.json()) as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry auth or quota errors
      if (
        lastError.message.includes('quota exceeded') ||
        lastError.message.includes('auth error')
      ) {
        throw lastError;
      }

      if (attempt < YOUTUBE_API_RETRY_COUNT - 1) {
        const delay = YOUTUBE_API_RETRY_DELAY_MS * Math.pow(2, attempt);
        console.warn(`YouTube API retry ${attempt + 1}/${YOUTUBE_API_RETRY_COUNT} after ${delay}ms`);
        await sleep(delay);
      }
    }
  }

  throw lastError || new Error('YouTube API request failed after retries');
}

// ---- Public Methods ----

/**
 * Get the uploads playlist ID for a channel.
 * Quota cost: 1 unit
 */
export async function getChannelUploadsPlaylistId(channelId: string): Promise<string> {
  const data = await ytFetch<{
    items: Array<{
      contentDetails: {
        relatedPlaylists: { uploads: string };
      };
    }>;
  }>('channels', {
    part: 'contentDetails',
    id: channelId,
    fields: 'items/contentDetails/relatedPlaylists/uploads',
  }, 1);

  if (!data.items || data.items.length === 0) {
    throw new Error(`Channel not found: ${channelId}`);
  }

  return data.items[0].contentDetails.relatedPlaylists.uploads;
}

/**
 * Get all video IDs from a playlist (paginated).
 * Quota cost: 1 unit per page (50 items per page)
 */
export async function getPlaylistVideoIds(playlistId: string): Promise<string[]> {
  const videoIds: string[] = [];
  let pageToken: string | undefined;

  do {
    const params: Record<string, string> = {
      part: 'contentDetails',
      playlistId,
      maxResults: YOUTUBE_MAX_RESULTS.toString(),
      fields: 'nextPageToken,items/contentDetails/videoId',
    };
    if (pageToken) params.pageToken = pageToken;

    const data = await ytFetch<YouTubeListResponse<YouTubePlaylistItemResource>>(
      'playlistItems',
      params,
      1
    );

    for (const item of data.items) {
      videoIds.push(item.contentDetails.videoId);
    }

    pageToken = data.nextPageToken;

    // Rate limit between pages
    if (pageToken) await sleep(YOUTUBE_API_CALL_DELAY_MS);
  } while (pageToken);

  return videoIds;
}

/**
 * Get video details for a batch of video IDs (up to 50).
 * Quota cost: 1 unit per batch
 */
export async function getVideoDetails(videoIds: string[]): Promise<YouTubeVideoResource[]> {
  if (videoIds.length === 0) return [];
  if (videoIds.length > YOUTUBE_MAX_RESULTS) {
    throw new Error(`Cannot fetch more than ${YOUTUBE_MAX_RESULTS} videos at once`);
  }

  const data = await ytFetch<YouTubeListResponse<YouTubeVideoResource>>(
    'videos',
    {
      part: 'snippet,liveStreamingDetails,contentDetails,statistics',
      id: videoIds.join(','),
    },
    1
  );

  return data.items;
}

/**
 * Search for live broadcasts by event type.
 * Quota cost: 100 units per call
 */
export async function searchBroadcasts(
  channelId: string,
  eventType: 'live' | 'upcoming' | 'completed'
): Promise<string[]> {
  const data = await ytFetch<YouTubeListResponse<YouTubeSearchResult>>(
    'search',
    {
      part: 'id',
      channelId,
      type: 'video',
      eventType,
      maxResults: YOUTUBE_MAX_RESULTS.toString(),
      fields: 'items/id/videoId',
    },
    100
  );

  return data.items
    .map((item) => item.id.videoId)
    .filter(Boolean);
}

/**
 * Batch fetch video details for an arbitrary number of IDs.
 * Splits into chunks of 50 and fetches sequentially.
 */
export async function batchGetVideoDetails(
  videoIds: string[]
): Promise<YouTubeVideoResource[]> {
  const results: YouTubeVideoResource[] = [];
  const chunks: string[][] = [];

  for (let i = 0; i < videoIds.length; i += YOUTUBE_MAX_RESULTS) {
    chunks.push(videoIds.slice(i, i + YOUTUBE_MAX_RESULTS));
  }

  for (const chunk of chunks) {
    const videos = await getVideoDetails(chunk);
    results.push(...videos);
    await sleep(YOUTUBE_API_CALL_DELAY_MS);
  }

  return results;
}

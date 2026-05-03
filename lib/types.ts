// ============================================================
// 360tv — Shared TypeScript Types
// ============================================================

// Stream status enum (matches DB values)
export type StreamStatus = 'LIVE' | 'UPCOMING' | 'PAST' | 'CANCELLED';

// Sport enum (matches DB values)
export type Sport = 'CRICKET' | 'FOOTBALL' | 'UNKNOWN';

// Sync status enum
export type SyncStatus = 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PARTIAL';

// Sync trigger enum
export type SyncTrigger = 'CRON' | 'MANUAL' | 'CRON_RSS';

// ---- API Request Types ----

export interface StreamsQueryParams {
  status?: StreamStatus | 'all';
  sport?: Sport | 'all';
  limit?: number;
  page?: number;
  searchQuery?: string;
}

// ---- API Response Types ----

export interface StreamResponse {
  id: string;
  youtubeVideoId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string;
  thumbnailHigh: string | null;
  status: StreamStatus;
  sport: Sport;
  scheduledStartTime: string | null;
  actualStartTime: string | null;
  actualEndTime: string | null;
  liveBroadcastContent: string | null;
  duration: string | null;
  viewCount: number | null;
  likeCount: number | null;
  concurrentViewers: number | null;
  channelId: string;
  channelTitle: string;
  lastSyncedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface StreamCountsResponse {
  live: number;
  upcoming: number;
  past: number;
}

export interface StreamsListResponse {
  data: StreamResponse[];
  meta: PaginationMeta;
  counts: StreamCountsResponse;
}

export interface SyncLogResponse {
  id: string;
  startedAt: string;
  completedAt: string | null;
  status: SyncStatus;
  trigger: SyncTrigger;
  totalFetched: number;
  totalUpserted: number;
  totalErrors: number;
  errorDetails: string | null;
  durationMs: number | null;
  quotaUsed: number | null;
}

export interface SyncResult {
  success: boolean;
  summary: {
    totalFetched: number;
    totalUpserted: number;
    totalErrors: number;
    durationMs: number;
    quotaUsed: number;
  };
}

// ---- YouTube API Types ----

export interface YouTubeVideoSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: {
    default?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    high?: { url: string; width: number; height: number };
    standard?: { url: string; width: number; height: number };
    maxres?: { url: string; width: number; height: number };
  };
  channelTitle: string;
  liveBroadcastContent: 'live' | 'upcoming' | 'none';
}

export interface YouTubeLiveStreamingDetails {
  actualStartTime?: string;
  actualEndTime?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  concurrentViewers?: string;
  activeLiveChatId?: string;
}

export interface YouTubeContentDetails {
  duration?: string;
}

export interface YouTubeVideoResource {
  kind: string;
  etag: string;
  id: string;
  snippet: YouTubeVideoSnippet;
  liveStreamingDetails?: YouTubeLiveStreamingDetails;
  contentDetails?: YouTubeContentDetails;
  statistics?: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
}

export interface YouTubePlaylistItemResource {
  kind: string;
  etag: string;
  id: string;
  contentDetails: {
    videoId: string;
    videoPublishedAt?: string;
  };
  snippet?: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: YouTubeVideoSnippet['thumbnails'];
    channelTitle: string;
    resourceId: {
      kind: string;
      videoId: string;
    };
  };
}

export interface YouTubeListResponse<T> {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: T[];
}

export interface YouTubeSearchResult {
  kind: string;
  etag: string;
  id: {
    kind: string;
    videoId: string;
  };
  snippet?: YouTubeVideoSnippet;
}

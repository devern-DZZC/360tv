// ============================================================
// 360tv — Stream Service
// Database query layer for stream data.
// Used by both API routes and server components.
// ============================================================

import { prisma } from '@/lib/prisma';
import type { StreamStatus, Sport, StreamCountsResponse } from '@/lib/types';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/constants';

interface GetStreamsOptions {
  status?: StreamStatus | 'all';
  sport?: Sport | 'all';
  limit?: number;
  cursor?: string;
  sort?: 'newest' | 'oldest' | 'starting_soon';
}

/**
 * Get streams with filtering, sorting, and cursor-based pagination.
 */
export async function getStreams(options: GetStreamsOptions = {}) {
  const {
    status = 'all',
    sport = 'all',
    limit: rawLimit = DEFAULT_PAGE_SIZE,
    cursor,
    sort,
  } = options;

  const limit = Math.min(Math.max(rawLimit, 1), MAX_PAGE_SIZE);

  // Build where clause
  const where: any = {};
  if (status && status !== 'all') {
    where.status = status;
  }
  if (sport && sport !== 'all') {
    where.sport = sport;
  }

  // Determine sort order
  let orderBy: any;
  const effectiveSort = sort || getDefaultSort(status);
  switch (effectiveSort) {
    case 'starting_soon':
      orderBy = [{ scheduledStartTime: 'asc' }, { createdAt: 'desc' }];
      break;
    case 'oldest':
      orderBy = [{ createdAt: 'asc' }];
      break;
    case 'newest':
    default:
      if (status === 'LIVE') {
        orderBy = [{ actualStartTime: 'desc' }, { createdAt: 'desc' }];
      } else if (status === 'UPCOMING') {
        orderBy = [{ scheduledStartTime: 'asc' }, { createdAt: 'desc' }];
      } else if (status === 'PAST') {
        orderBy = [{ actualEndTime: 'desc' }, { createdAt: 'desc' }];
      } else {
        orderBy = [{ createdAt: 'desc' }];
      }
  }

  const queryParams: any = {
    where,
    orderBy,
    take: limit + 1, // Fetch one extra to check if there's more
  };

  if (cursor) {
    queryParams.cursor = { id: cursor };
    queryParams.skip = 1;
  }

  const [streams, total] = await Promise.all([
    prisma.stream.findMany(queryParams),
    prisma.stream.count({ where }),
  ]);

  const hasMore = streams.length > limit;
  const data = hasMore ? streams.slice(0, limit) : streams;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return {
    data,
    meta: {
      total,
      limit,
      nextCursor,
      hasMore,
    },
  };
}

/**
 * Get a single stream by internal ID.
 */
export async function getStreamById(id: string) {
  return prisma.stream.findUnique({
    where: { id },
  });
}

/**
 * Get streams by status (convenience wrappers).
 */
export async function getLiveStreams(limit = 10) {
  return prisma.stream.findMany({
    where: { status: 'LIVE' },
    orderBy: { actualStartTime: 'desc' },
    take: limit,
  });
}

export async function getUpcomingStreams(limit = 10) {
  return prisma.stream.findMany({
    where: { status: 'UPCOMING' },
    orderBy: { scheduledStartTime: 'asc' },
    take: limit,
  });
}

export async function getPastStreams(limit = 10) {
  return prisma.stream.findMany({
    where: { status: 'PAST' },
    orderBy: { actualEndTime: 'desc' },
    take: limit,
  });
}

/**
 * Get featured streams for the homepage hero.
 * Priority: live streams first, then upcoming.
 */
export async function getFeaturedStreams(limit = 3) {
  const live = await getLiveStreams(limit);
  if (live.length >= limit) return live;

  const upcoming = await getUpcomingStreams(limit - live.length);
  return [...live, ...upcoming];
}

/**
 * Get stream counts by status.
 */
export async function getStreamCounts(): Promise<StreamCountsResponse> {
  const [live, upcoming, past] = await Promise.all([
    prisma.stream.count({ where: { status: 'LIVE' } }),
    prisma.stream.count({ where: { status: 'UPCOMING' } }),
    prisma.stream.count({ where: { status: 'PAST' } }),
  ]);

  return { live, upcoming, past };
}

/**
 * Default sort depends on the status filter.
 */
function getDefaultSort(status?: StreamStatus | 'all'): string {
  switch (status) {
    case 'UPCOMING':
      return 'starting_soon';
    case 'LIVE':
    case 'PAST':
      return 'newest';
    default:
      return 'newest';
  }
}

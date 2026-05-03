// ============================================================
// 360tv — Stream Service
// Database query layer for stream data.
// Used by both API routes and server components.
// ============================================================

import { Prisma, type Stream } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { StreamStatus, Sport, StreamCountsResponse } from '@/lib/types';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/constants';

interface GetStreamsOptions {
  status?: StreamStatus | 'all';
  sport?: Sport | 'all';
  limit?: number;
  page?: number;
  searchQuery?: string;
}

/**
 * Get streams with filtering, fuzzy title search, and page-based pagination.
 *
 * Ordering is fixed globally:
 * 1. LIVE
 * 2. UPCOMING (earliest scheduled first)
 * 3. PAST (most recent first)
 * 4. CANCELLED (kept last for completeness)
 */
export async function getStreams(options: GetStreamsOptions = {}) {
  const {
    status = 'all',
    sport = 'all',
    limit: rawLimit = DEFAULT_PAGE_SIZE,
    page: rawPage = 1,
    searchQuery,
  } = options;

  const limit = Math.min(Math.max(rawLimit, 1), MAX_PAGE_SIZE);
  const requestedPage = Math.max(rawPage, 1);
  const trimmedSearchQuery = searchQuery?.trim() || '';

  const conditions: Prisma.Sql[] = [];
  if (status !== 'all') {
    conditions.push(Prisma.sql`"status" = ${status}`);
  }
  if (sport !== 'all') {
    conditions.push(Prisma.sql`"sport" = ${sport}`);
  }
  if (trimmedSearchQuery) {
    const compactQuery = normalizeSearchQuery(trimmedSearchQuery);
    const tokens = trimmedSearchQuery
      .split(/\s+/)
      .map(normalizeSearchQuery)
      .filter(Boolean);
    const normalizedTitle = Prisma.sql`regexp_replace(lower("title"), '[^a-z0-9]+', '', 'g')`;
    const searchClauses: Prisma.Sql[] = [
      Prisma.sql`"title" ILIKE ${`%${trimmedSearchQuery}%`}`,
    ];

    if (compactQuery) {
      searchClauses.push(
        Prisma.sql`${normalizedTitle} LIKE ${`%${compactQuery}%`}`
      );
    }

    const tokenMatchers = tokens.map((token) => Prisma.sql`${normalizedTitle} LIKE ${`%${token}%`}`);
    if (tokenMatchers.length > 0) {
      searchClauses.push(
        Prisma.sql`(${Prisma.join(tokenMatchers, ' AND ')})`
      );
    }

    conditions.push(
      Prisma.sql`(${Prisma.join(searchClauses, ' OR ')})`
    );
  }

  const whereClause =
    conditions.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;

  const countResult = await prisma.$queryRaw<Array<{ total: number }>>(Prisma.sql`
    SELECT COUNT(*)::int AS total
    FROM "Stream"
    ${whereClause}
  `);

  const total = countResult[0]?.total ?? 0;
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  const page = totalPages === 0 ? 1 : Math.min(requestedPage, totalPages);
  const offset = (page - 1) * limit;

  const data = await prisma.$queryRaw<Stream[]>(Prisma.sql`
    SELECT *
    FROM "Stream"
    ${whereClause}
    ORDER BY
      CASE
        WHEN COALESCE("actualStartTime", "actualEndTime", "scheduledStartTime") IS NULL THEN 1
        ELSE 0
      END ASC,
      CASE
        WHEN "status" = 'LIVE' THEN 0
        WHEN "status" = 'UPCOMING' THEN 1
        WHEN "status" = 'PAST' THEN 2
        ELSE 3
      END ASC,
      CASE
        WHEN "status" = 'LIVE' THEN COALESCE("actualStartTime", "scheduledStartTime", "createdAt")
      END DESC NULLS LAST,
      CASE
        WHEN "status" = 'UPCOMING' THEN COALESCE("scheduledStartTime", "createdAt")
      END ASC NULLS LAST,
      CASE
        WHEN "status" = 'PAST' THEN COALESCE("actualEndTime", "actualStartTime", "scheduledStartTime", "createdAt")
      END DESC NULLS LAST,
      CASE
        WHEN "status" = 'CANCELLED' THEN COALESCE("scheduledStartTime", "createdAt")
      END DESC NULLS LAST,
      "createdAt" DESC,
      "id" DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `);

  return {
    data,
    meta: {
      total,
      page,
      pageSize: limit,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: totalPages > 0 && page < totalPages,
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
    where: {
      status: 'PAST',
      actualEndTime: { not: null },
    },
    orderBy: { actualEndTime: 'desc' },
    take: limit,
  });
}

/**
 * Get featured streams for the homepage hero.
 * Priority: live streams first, then upcoming.
 */
export async function getFeaturedStreams(limit = 3) {
  let featured = await getLiveStreams(limit);
  if (featured.length >= limit) return featured;

  const upcoming = await getUpcomingStreams(limit - featured.length);
  featured = [...featured, ...upcoming];
  if (featured.length >= limit) return featured;

  const past = await getPastStreams(limit - featured.length);
  return [...featured, ...past];
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

function normalizeSearchQuery(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

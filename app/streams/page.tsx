import { Suspense } from "react";
import { getStreams, getStreamCounts } from "@/lib/services/stream-service";
import StreamGrid from "@/components/streams/StreamGrid";
import StreamFilters from "@/components/streams/StreamFilters";
import StreamSkeleton from "@/components/streams/StreamSkeleton";
import type { StreamStatus, Sport } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Streams",
  description:
    "Browse all live, upcoming, and past cricket & football streams on 360tv.",
};

export const revalidate = 300;

interface StreamsPageProps {
  searchParams: Promise<{
    status?: string;
    sport?: string;
    cursor?: string;
  }>;
}

export default async function StreamsPage({ searchParams }: StreamsPageProps) {
  const params = await searchParams;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-brand-white tracking-wide">
          All Streams
        </h1>
        <p className="text-brand-offwhite-dim text-sm mt-1">
          Browse live, upcoming, and past cricket & football streams
        </p>
      </div>

      <Suspense fallback={<StreamSkeleton count={8} />}>
        <StreamsContent
          statusParam={params.status}
          sportParam={params.sport}
          cursorParam={params.cursor}
        />
      </Suspense>
    </div>
  );
}

async function StreamsContent({
  statusParam,
  sportParam,
  cursorParam,
}: {
  statusParam?: string;
  sportParam?: string;
  cursorParam?: string;
}) {
  const rawStatus = statusParam?.toUpperCase() || 'all';
  const rawSport = sportParam?.toUpperCase() || 'all';

  const validStatuses = ['LIVE', 'UPCOMING', 'PAST', 'CANCELLED'];
  const validSports = ['CRICKET', 'FOOTBALL', 'UNKNOWN'];

  const status: StreamStatus | 'all' = validStatuses.includes(rawStatus)
    ? (rawStatus as StreamStatus)
    : 'all';
  const sport: Sport | 'all' = validSports.includes(rawSport)
    ? (rawSport as Sport)
    : 'all';

  const [result, counts] = await Promise.all([
    getStreams({
      status,
      sport,
      limit: 12,
      cursor: cursorParam,
    }),
    getStreamCounts(),
  ]);

  const statusLabel =
    status && status !== "all" ? status.toLowerCase() : "";
  const sportLabel =
    sport && sport !== "all" ? sport.toLowerCase() : "";
  const emptyMessage = `No ${sportLabel} ${statusLabel} streams found.`;

  return (
    <div className="space-y-6">
      <StreamFilters counts={counts} />
      <StreamGrid streams={result.data} emptyMessage={emptyMessage} />

      {/* Load more */}
      {result.meta.hasMore && result.meta.nextCursor && (
        <div className="flex justify-center pt-4">
          <a
            href={`/streams?${new URLSearchParams({
              ...(statusParam ? { status: statusParam } : {}),
              ...(sportParam ? { sport: sportParam } : {}),
              cursor: result.meta.nextCursor,
            }).toString()}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-glass border border-white/[0.06] text-brand-offwhite hover:text-brand-white hover:bg-surface-glass-hover transition-all text-sm font-medium"
          >
            Load More
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}

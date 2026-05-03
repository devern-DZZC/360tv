import { Suspense } from "react";
import { getStreams, getStreamCounts } from "@/lib/services/stream-service";
import StreamGrid from "@/components/streams/StreamGrid";
import StreamFilters from "@/components/streams/StreamFilters";
import StreamsResultsSkeleton from "@/components/streams/StreamsResultsSkeleton";
import SearchBar from "@/components/streams/SearchBar";
import Pagination from "@/components/streams/Pagination";
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
    search?: string;
    page?: string;
  }>;
}

export default async function StreamsPage({ searchParams }: StreamsPageProps) {
  const params = await searchParams;
  const counts = await getStreamCounts();
  const resultsKey = `${params.status || "all"}:${params.sport || "all"}:${params.search || ""}:${params.page || "1"}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8 space-y-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-brand-white tracking-wide">
          All Streams
        </h1>
        <p className="text-brand-offwhite-dim text-sm mt-1">
          Browse live, upcoming, and past cricket & football streams
        </p>

        <SearchBar />
        <StreamFilters counts={counts} />
      </div>

      <Suspense key={resultsKey} fallback={<StreamsResultsSkeleton />}>
        <StreamsContent
          statusParam={params.status}
          sportParam={params.sport}
          searchParam={params.search}
          pageParam={params.page}
        />
      </Suspense>
    </div>
  );
}

async function StreamsContent({
  statusParam,
  sportParam,
  searchParam,
  pageParam,
}: {
  statusParam?: string;
  sportParam?: string;
  searchParam?: string;
  pageParam?: string;
}) {
  const rawStatus = statusParam?.toUpperCase() || "all";
  const rawSport = sportParam?.toUpperCase() || "all";
  const rawSearchQuery = searchParam?.trim() || "";
  const rawPage = Number.parseInt(pageParam || "1", 10);

  const validStatuses = ["LIVE", "UPCOMING", "PAST", "CANCELLED"];
  const validSports = ["CRICKET", "FOOTBALL", "UNKNOWN"];

  const status: StreamStatus | "all" = validStatuses.includes(rawStatus)
    ? (rawStatus as StreamStatus)
    : "all";
  const sport: Sport | "all" = validSports.includes(rawSport)
    ? (rawSport as Sport)
    : "all";
  const page = Number.isNaN(rawPage) ? 1 : Math.max(rawPage, 1);

  const result = await getStreams({
    status,
    sport,
    searchQuery: rawSearchQuery,
    page,
    limit: 12,
  });

  const statusLabel =
    status && status !== "all" ? status.toLowerCase() : "";
  const sportLabel =
    sport && sport !== "all" ? sport.toLowerCase() : "";
  const emptyPrefix = rawSearchQuery ? "No matching" : "No";
  const emptyMessage = `${emptyPrefix} ${sportLabel} ${statusLabel} streams found.`
    .replace(/\s+/g, " ")
    .trim();

  return (
    <div className="space-y-6">
      <StreamGrid streams={result.data} emptyMessage={emptyMessage} />
      <Pagination
        currentPage={result.meta.page}
        totalPages={result.meta.totalPages}
        totalItems={result.meta.total}
        pageSize={result.meta.pageSize}
        status={status}
        sport={sport}
        searchQuery={rawSearchQuery}
      />
    </div>
  );
}

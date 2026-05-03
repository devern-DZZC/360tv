import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Sport, StreamStatus } from "@/lib/types";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  status?: StreamStatus | "all";
  sport?: Sport | "all";
  searchQuery?: string;
}

type PageItem = number | "ellipsis";

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  status = "all",
  sport = "all",
  searchQuery,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const pageItems = buildPageItems(currentPage, totalPages);

  return (
    <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.035] px-4 py-4 shadow-[0_18px_60px_rgba(6,10,28,0.35)] backdrop-blur-xl sm:px-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-brand-offwhite-dim">
          Showing{" "}
          <span className="font-semibold text-brand-white">{startItem}</span>
          {" "}to{" "}
          <span className="font-semibold text-brand-white">{endItem}</span>
          {" "}of{" "}
          <span className="font-semibold text-brand-white">{totalItems}</span>
          {" "}streams
        </div>

        <nav
          className="flex flex-wrap items-center gap-2"
          aria-label="Streams pagination"
        >
          <PaginationArrow
            direction="previous"
            disabled={currentPage <= 1}
            href={buildStreamsHref({
              page: currentPage - 1,
              status,
              sport,
              searchQuery,
            })}
          />

          <div className="flex flex-wrap items-center gap-2">
            {pageItems.map((item, index) =>
              item === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="inline-flex h-11 min-w-11 items-center justify-center rounded-2xl border border-white/6 px-3 text-sm text-brand-offwhite-dim"
                >
                  ...
                </span>
              ) : (
                <Link
                  key={item}
                  href={buildStreamsHref({ page: item, status, sport, searchQuery })}
                  scroll={false}
                  aria-current={item === currentPage ? "page" : undefined}
                  className={cn(
                    "inline-flex h-11 min-w-11 items-center justify-center rounded-2xl border px-4 text-sm font-semibold transition-all",
                    item === currentPage
                      ? "border-white/18 bg-white/[0.12] text-brand-white shadow-[0_12px_30px_rgba(10,18,54,0.35)]"
                      : "border-white/8 bg-white/[0.03] text-brand-offwhite-dim hover:border-white/16 hover:bg-white/[0.08] hover:text-brand-white"
                  )}
                >
                  {item}
                </Link>
              )
            )}
          </div>

          <PaginationArrow
            direction="next"
            disabled={currentPage >= totalPages}
            href={buildStreamsHref({
              page: currentPage + 1,
              status,
              sport,
              searchQuery,
            })}
          />
        </nav>
      </div>
    </div>
  );
}

function PaginationArrow({
  direction,
  disabled,
  href,
}: {
  direction: "previous" | "next";
  disabled: boolean;
  href: string;
}) {
  const isPrevious = direction === "previous";

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/6 bg-white/[0.025] px-4 text-sm font-medium text-brand-offwhite-dim/45"
      >
        <ArrowIcon direction={direction} />
        {isPrevious ? "Previous" : "Next"}
      </span>
    );
  }

  return (
    <Link
      href={href}
      scroll={false}
      className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-4 text-sm font-medium text-brand-offwhite-dim transition-all hover:border-white/16 hover:bg-white/[0.08] hover:text-brand-white"
    >
      <ArrowIcon direction={direction} />
      {isPrevious ? "Previous" : "Next"}
    </Link>
  );
}

function ArrowIcon({ direction }: { direction: "previous" | "next" }) {
  return (
    <svg
      className={cn("h-4 w-4", direction === "next" && "rotate-180")}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M15 19l-7-7 7-7"
      />
    </svg>
  );
}

function buildPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}

function buildStreamsHref({
  page,
  status,
  sport,
  searchQuery,
}: {
  page: number;
  status?: StreamStatus | "all";
  sport?: Sport | "all";
  searchQuery?: string;
}) {
  const params = new URLSearchParams();

  if (status && status !== "all") {
    params.set("status", status.toLowerCase());
  }
  if (sport && sport !== "all") {
    params.set("sport", sport.toLowerCase());
  }

  const trimmedSearchQuery = searchQuery?.trim();
  if (trimmedSearchQuery) {
    params.set("search", trimmedSearchQuery);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const queryString = params.toString();
  return queryString ? `/streams?${queryString}` : "/streams";
}

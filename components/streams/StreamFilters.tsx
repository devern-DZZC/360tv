"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { StreamCountsResponse } from "@/lib/types";

interface StreamFiltersProps {
  counts: StreamCountsResponse;
}

export default function StreamFilters({ counts }: StreamFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") || "all";
  const currentSport = searchParams.get("sport") || "all";

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // Reset cursor when changing filters
    params.delete("cursor");
    router.push(`/streams?${params.toString()}`, { scroll: false });
  }

  const statusFilters = [
    { value: "all", label: "All", count: counts.live + counts.upcoming + counts.past },
    { value: "live", label: "Live", count: counts.live },
    { value: "upcoming", label: "Upcoming", count: counts.upcoming },
    { value: "past", label: "Past", count: counts.past },
  ];

  const sportFilters = [
    { value: "all", label: "All Sports" },
    { value: "cricket", label: "🏏 Cricket" },
    { value: "football", label: "⚽ Football" },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
      {/* Status tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-surface-glass border border-white/[0.06]">
        {statusFilters.map(({ value, label, count }) => (
          <button
            key={value}
            onClick={() => updateParams("status", value)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
              currentStatus === value
                ? "bg-brand-navy-light text-brand-white shadow-sm"
                : "text-brand-offwhite-dim hover:text-brand-white hover:bg-white/[0.03]"
            )}
          >
            {label}
            {count > 0 && (
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
                  currentStatus === value
                    ? "bg-white/10 text-brand-white"
                    : "bg-white/5 text-brand-offwhite-dim"
                )}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Sport chips */}
      <div className="flex gap-1.5">
        {sportFilters.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => updateParams("sport", value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
              currentSport === value
                ? "border-brand-navy-light bg-brand-navy-light text-brand-white"
                : "border-white/[0.06] text-brand-offwhite-dim hover:text-brand-white hover:border-white/[0.12]"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

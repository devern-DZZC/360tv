"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { StreamCountsResponse } from "@/lib/types";

interface StreamFiltersProps {
  counts: StreamCountsResponse;
}

export default function StreamFilters({ counts }: StreamFiltersProps) {
  const pathname = usePathname();
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
    // A new filter combination should always begin from page one.
    params.delete("page");

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
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
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      {/* Status tabs */}
      <div className="flex flex-wrap gap-1 rounded-2xl border border-white/[0.06] bg-surface-glass p-1.5 backdrop-blur-xl">
        {statusFilters.map(({ value, label, count }) => (
          <button
            key={value}
            onClick={() => updateParams("status", value)}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-all",
              currentStatus === value
                ? "bg-brand-navy-light text-brand-white shadow-[0_10px_24px_rgba(15,22,52,0.3)]"
                : "text-brand-offwhite-dim hover:bg-white/[0.03] hover:text-brand-white"
            )}
          >
            {label}
            {count > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
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
      <div className="flex flex-wrap gap-1.5">
        {sportFilters.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => updateParams("sport", value)}
            className={cn(
              "rounded-full border px-3.5 py-2 text-xs font-medium transition-all",
              currentSport === value
                ? "border-brand-navy-light bg-brand-navy-light text-brand-white shadow-[0_10px_24px_rgba(15,22,52,0.25)]"
                : "border-white/[0.06] bg-white/[0.02] text-brand-offwhite-dim hover:border-white/[0.12] hover:text-brand-white"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

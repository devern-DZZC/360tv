"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SEARCH_DEBOUNCE_MS = 300;

export default function SearchBar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") || "";
  const [value, setValue] = useState(currentSearch);

  useEffect(() => {
    const nextSearch = value.trim();
    if (nextSearch === currentSearch) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (nextSearch) {
        params.set("search", nextSearch);
      } else {
        params.delete("search");
      }

      // A new query should always begin from the first page.
      params.delete("page");

      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [currentSearch, pathname, router, searchParams, value]);

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.045] shadow-[0_24px_80px_rgba(7,12,35,0.45)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <div className="pointer-events-none absolute -left-16 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-brand-navy-light/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-8 top-3 h-24 w-24 rounded-full bg-accent-football/15 blur-3xl" />

      <div className="relative flex flex-col gap-3 px-4 py-4 sm:px-5">
        <div>
          <p className="font-[family-name:var(--font-display)] text-[11px] uppercase tracking-[0.28em] text-brand-offwhite-dim/80">
            Search Streams
          </p>
          <p className="mt-1 text-sm text-brand-offwhite-dim">
            Find streams instantly by title, teams, leagues, or keywords.
          </p>
        </div>

        <div className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-brand-navy-deep/55 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors focus-within:border-white/20 focus-within:bg-brand-navy-deep/75">
          <svg
            className="h-5 w-5 flex-shrink-0 text-brand-offwhite-dim transition-colors group-focus-within:text-brand-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
            />
          </svg>

          <input
            type="search"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Search streams, teams, tournaments..."
            className="w-full bg-transparent text-base text-brand-white outline-none placeholder:text-brand-offwhite-dim/55"
            aria-label="Search streams"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}

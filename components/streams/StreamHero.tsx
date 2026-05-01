import Image from "next/image";
import Link from "next/link";
import StreamStatusBadge from "./StreamStatusBadge";
import SportBadge from "./SportBadge";
import StreamCountdown from "./StreamCountdown";
import StreamEmbed from "./StreamEmbed";
import type { StreamStatus, Sport } from "@/lib/types";
import { formatDateTime, formatViewCount } from "@/lib/utils";

interface StreamData {
  id: string;
  youtubeVideoId: string;
  title: string;
  thumbnailUrl: string;
  thumbnailHigh?: string | null;
  status: string;
  sport: string;
  scheduledStartTime: string | Date | null;
  actualStartTime: string | Date | null;
  concurrentViewers?: number | null;
  channelTitle: string;
}

interface StreamHeroProps {
  featured: StreamData[];
}

export default function StreamHero({ featured }: StreamHeroProps) {
  if (featured.length === 0) {
    return <EmptyHero />;
  }

  const primary = featured[0];
  const isLive = primary.status === "LIVE";
  const secondaries = featured.slice(1, 3);

  return (
    <section className="relative overflow-hidden">
      {/* Ambient glow */}
      {isLive && (
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[120px] pointer-events-none"
          style={{ background: "var(--accent-live-glow)", opacity: 0.15 }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className={secondaries.length > 0 ? "grid grid-cols-1 lg:grid-cols-3 gap-5" : ""}>
          {/* Primary stream */}
          <div className={secondaries.length > 0 ? "lg:col-span-2" : ""}>
            <div className="animate-slide-up">
              {isLive ? (
                <StreamEmbed
                  videoId={primary.youtubeVideoId}
                  title={primary.title}
                  autoplay
                />
              ) : (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-brand-navy border border-white/[0.06]">
                  <Image
                    src={primary.thumbnailHigh || primary.thumbnailUrl}
                    alt={primary.title}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Countdown overlay for upcoming */}
                  {primary.status === "UPCOMING" && primary.scheduledStartTime && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-xs sm:text-sm text-brand-offwhite-dim mb-2 font-[family-name:var(--font-display)] uppercase tracking-wider">
                        Starting in
                      </p>
                      <StreamCountdown targetDate={primary.scheduledStartTime} />
                    </div>
                  )}
                </div>
              )}

              {/* Stream info below player */}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <StreamStatusBadge status={primary.status as StreamStatus} size="md" />
                    <SportBadge sport={primary.sport as Sport} size="md" />
                  </div>
                  <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-brand-white leading-tight">
                    {primary.title}
                  </h2>
                  <p className="text-sm text-brand-offwhite-dim mt-1">
                    {primary.channelTitle}
                    {isLive && primary.concurrentViewers && (
                      <span className="ml-2">
                        · {formatViewCount(primary.concurrentViewers)} watching
                      </span>
                    )}
                  </p>
                </div>
                <Link
                  href={`/streams/${primary.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-navy-light text-brand-white text-sm font-medium hover:bg-brand-navy-mid transition-colors flex-shrink-0"
                >
                  View Details
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Secondary streams */}
          {secondaries.length > 0 && (
            <div className="flex flex-col gap-4">
              {secondaries.map((stream, i) => (
                <Link
                  key={stream.id}
                  href={`/streams/${stream.id}`}
                  className="stream-card group flex gap-3 p-3 rounded-xl border border-white/[0.06] bg-surface-glass"
                  style={{ animation: `fade-in 0.4s ease-out ${0.2 + i * 0.1}s both` }}
                >
                  <div className="relative w-32 sm:w-40 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-brand-navy">
                    <Image
                      src={stream.thumbnailHigh || stream.thumbnailUrl}
                      alt={stream.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="160px"
                    />
                    <div className="absolute top-1.5 left-1.5">
                      <StreamStatusBadge status={stream.status as StreamStatus} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <div className="mb-1">
                      <SportBadge sport={stream.sport as Sport} />
                    </div>
                    <h3 className="font-[family-name:var(--font-display)] text-sm font-semibold text-brand-white leading-tight line-clamp-2 group-hover:text-brand-offwhite transition-colors">
                      {stream.title}
                    </h3>
                    <p className="text-[11px] text-brand-offwhite-dim mt-1.5 font-[family-name:var(--font-mono)]">
                      {stream.scheduledStartTime
                        ? formatDateTime(stream.scheduledStartTime)
                        : "Time TBD"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function EmptyHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="flex flex-col items-center text-center animate-fade-in">
          <div className="relative mb-6">
            <Image
              src="/360tv-logo.png"
              alt="360tv"
              width={80}
              height={80}
              className="rounded-full"
            />
            <div
              className="absolute inset-0 rounded-full blur-xl"
              style={{ background: "var(--brand-navy-light)", opacity: 0.4 }}
            />
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-brand-white mb-3">
            Welcome to 360tv
          </h1>
          <p className="text-brand-offwhite-dim text-lg max-w-md mb-6">
            Your hub for live cricket and football streams. Check back soon for
            upcoming matches!
          </p>
          <Link
            href="/streams"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-navy-light text-brand-white font-medium hover:bg-brand-navy-mid transition-colors"
          >
            Browse Streams
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

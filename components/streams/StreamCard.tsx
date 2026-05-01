import Image from "next/image";
import Link from "next/link";
import StreamStatusBadge from "./StreamStatusBadge";
import SportBadge from "./SportBadge";
import { formatDateTime, formatViewCount, cn } from "@/lib/utils";
import type { StreamStatus, Sport } from "@/lib/types";

interface StreamCardProps {
  id: string;
  youtubeVideoId: string;
  title: string;
  thumbnailUrl: string;
  thumbnailHigh?: string | null;
  status: StreamStatus;
  sport: Sport;
  scheduledStartTime: string | Date | null;
  actualStartTime: string | Date | null;
  actualEndTime: string | Date | null;
  concurrentViewers?: number | null;
  channelTitle: string;
  index?: number;
}

export default function StreamCard({
  id,
  title,
  thumbnailUrl,
  thumbnailHigh,
  status,
  sport,
  scheduledStartTime,
  actualStartTime,
  actualEndTime,
  concurrentViewers,
  channelTitle,
  index = 0,
}: StreamCardProps) {
  const imgSrc = thumbnailHigh || thumbnailUrl;

  // Determine display time
  let displayTime: string;
  if (status === "LIVE" && actualStartTime) {
    displayTime = `Started ${formatDateTime(actualStartTime)}`;
  } else if (status === "PAST" && actualEndTime) {
    displayTime = `Ended ${formatDateTime(actualEndTime)}`;
  } else if (scheduledStartTime) {
    displayTime = formatDateTime(scheduledStartTime);
  } else {
    displayTime = "Time TBD";
  }

  return (
    <Link
      href={`/streams/${id}`}
      className={cn(
        "stream-card group block rounded-xl overflow-hidden",
        "border border-white/[0.06] bg-surface-glass",
        status === "LIVE" && "stream-card-live"
      )}
      style={{
        animation: `fade-in 0.4s ease-out ${index * 0.05}s both`,
      }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-brand-navy">
        <Image
          src={imgSrc}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={cn(
            "object-cover transition-transform duration-300 group-hover:scale-105",
            status === "PAST" && "opacity-70"
          )}
        />

        {/* Overlay badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          <StreamStatusBadge status={status} />
        </div>
        <div className="absolute top-2.5 right-2.5">
          <SportBadge sport={sport} />
        </div>

        {/* Live viewers */}
        {status === "LIVE" && concurrentViewers && (
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 bg-black/60 rounded-full px-2.5 py-1 text-[11px] font-medium text-brand-white backdrop-blur-sm">
            <svg
              className="w-3 h-3 text-accent-live"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
            {formatViewCount(concurrentViewers)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-[family-name:var(--font-display)] text-[15px] font-semibold text-brand-white leading-tight line-clamp-2 mb-2 group-hover:text-brand-offwhite transition-colors">
          {title}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-brand-offwhite-dim font-[family-name:var(--font-mono)]">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{displayTime}</span>
        </div>

        <p className="text-[11px] text-brand-offwhite-dim/60 mt-2 truncate">
          {channelTitle}
        </p>
      </div>
    </Link>
  );
}

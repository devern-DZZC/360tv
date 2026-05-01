import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getStreamById, getStreams } from "@/lib/services/stream-service";
import StreamEmbed from "@/components/streams/StreamEmbed";
import StreamStatusBadge from "@/components/streams/StreamStatusBadge";
import SportBadge from "@/components/streams/SportBadge";
import StreamCountdown from "@/components/streams/StreamCountdown";
import StreamGrid from "@/components/streams/StreamGrid";
import { formatDateTime, getYouTubeWatchUrl, truncate } from "@/lib/utils";
import type { StreamStatus, Sport } from "@/lib/types";

export const revalidate = 600; // ISR: 10 minutes

interface StreamDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: StreamDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const stream = await getStreamById(id);

  if (!stream) {
    return { title: "Stream Not Found" };
  }

  return {
    title: stream.title,
    description: stream.description
      ? truncate(stream.description, 160)
      : `Watch ${stream.title} on 360tv`,
    openGraph: {
      title: `${stream.title} — 360tv`,
      description: stream.description
        ? truncate(stream.description, 160)
        : `Watch ${stream.title} on 360tv`,
      images: [
        {
          url: stream.thumbnailHigh || stream.thumbnailUrl,
          width: 1280,
          height: 720,
        },
      ],
      type: "video.other",
    },
  };
}

export default async function StreamDetailPage({
  params,
}: StreamDetailPageProps) {
  const { id } = await params;
  const stream = await getStreamById(id);

  if (!stream) {
    notFound();
  }

  const status = stream.status as StreamStatus;
  const sport = stream.sport as Sport;

  // Get related streams (same sport or same status, exclude current)
  const related = await getStreams({
    sport: sport !== "UNKNOWN" ? sport : "all",
    limit: 4,
  });
  const relatedFiltered = related.data.filter((s: { id: string }) => s.id !== stream.id).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-brand-offwhite-dim mb-5 animate-fade-in">
        <Link href="/streams" className="hover:text-brand-white transition-colors">
          Streams
        </Link>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-brand-white truncate max-w-[200px] sm:max-w-none">
          {stream.title}
        </span>
      </nav>

      {/* Video section */}
      <div className="animate-slide-up">
        {status === "LIVE" || status === "PAST" ? (
          <StreamEmbed videoId={stream.youtubeVideoId} title={stream.title} autoplay={status === "LIVE"} />
        ) : (
          <div className="relative aspect-video rounded-xl overflow-hidden bg-brand-navy border border-white/[0.06]">
            <Image
              src={stream.thumbnailHigh || stream.thumbnailUrl}
              alt={stream.title}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {status === "UPCOMING" && stream.scheduledStartTime && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xs text-brand-offwhite-dim mb-2 font-[family-name:var(--font-display)] uppercase tracking-wider">
                  Starting in
                </p>
                <StreamCountdown targetDate={stream.scheduledStartTime} />
              </div>
            )}

            {/* Watch on YouTube link */}
            <a
              href={getYouTubeWatchUrl(stream.youtubeVideoId)}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm text-brand-white text-sm font-medium hover:bg-black/80 transition-colors"
            >
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
                <path fill="#fff" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              Watch on YouTube
            </a>
          </div>
        )}
      </div>

      {/* Stream info */}
      <div className="mt-6 space-y-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
        <div className="flex flex-wrap items-center gap-2">
          <StreamStatusBadge status={status} size="md" />
          <SportBadge sport={sport} size="md" />
        </div>

        <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-bold text-brand-white leading-tight">
          {stream.title}
        </h1>

        <div className="glass-surface rounded-xl p-4 sm:p-5 space-y-3">
          {stream.scheduledStartTime && (
            <InfoRow
              label="Scheduled"
              value={formatDateTime(stream.scheduledStartTime)}
            />
          )}
          {stream.actualStartTime && (
            <InfoRow
              label="Started"
              value={formatDateTime(stream.actualStartTime)}
            />
          )}
          {stream.actualEndTime && (
            <InfoRow
              label="Ended"
              value={formatDateTime(stream.actualEndTime)}
            />
          )}
          <InfoRow label="Channel" value={stream.channelTitle} />

          {/* Watch on YouTube button */}
          <div className="pt-2">
            <a
              href={getYouTubeWatchUrl(stream.youtubeVideoId)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#ff0000]/10 text-[#ff4444] text-sm font-semibold hover:bg-[#ff0000]/20 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
                <path fill="#fff" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              Watch on YouTube
            </a>
          </div>
        </div>

        {/* Description */}
        {stream.description && (
          <div className="glass-surface rounded-xl p-4 sm:p-5">
            <h2 className="font-[family-name:var(--font-display)] text-sm font-semibold text-brand-offwhite uppercase tracking-wider mb-3">
              Description
            </h2>
            <p className="text-sm text-brand-offwhite-dim leading-relaxed whitespace-pre-line">
              {stream.description}
            </p>
          </div>
        )}
      </div>

      {/* Related streams */}
      {relatedFiltered.length > 0 && (
        <section className="mt-12 pt-8 border-t border-white/[0.06]">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-brand-white tracking-wide mb-5">
            More Streams
          </h2>
          <StreamGrid streams={relatedFiltered} />
        </section>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 sm:gap-4">
      <span className="text-xs text-brand-offwhite-dim font-[family-name:var(--font-display)] uppercase tracking-wider w-20 flex-shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-sm text-brand-white font-[family-name:var(--font-mono)]">
        {value}
      </span>
    </div>
  );
}

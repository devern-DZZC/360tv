import StreamCard from "./StreamCard";
import type { StreamStatus, Sport } from "@/lib/types";

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
  actualEndTime: string | Date | null;
  concurrentViewers?: number | null;
  channelTitle: string;
}

interface StreamGridProps {
  streams: StreamData[];
  emptyMessage?: string;
}

export default function StreamGrid({ streams, emptyMessage }: StreamGridProps) {
  if (streams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-surface-glass flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-brand-offwhite-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-brand-offwhite-dim text-sm text-center">
          {emptyMessage || "No streams found"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {streams.map((stream, index) => (
        <StreamCard
          key={stream.id}
          id={stream.id}
          youtubeVideoId={stream.youtubeVideoId}
          title={stream.title}
          thumbnailUrl={stream.thumbnailUrl}
          thumbnailHigh={stream.thumbnailHigh}
          status={stream.status as StreamStatus}
          sport={stream.sport as Sport}
          scheduledStartTime={stream.scheduledStartTime}
          actualStartTime={stream.actualStartTime}
          actualEndTime={stream.actualEndTime}
          concurrentViewers={stream.concurrentViewers}
          channelTitle={stream.channelTitle}
          index={index}
        />
      ))}
    </div>
  );
}

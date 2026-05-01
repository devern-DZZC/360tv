"use client";

import { getYouTubeEmbedUrl } from "@/lib/utils";

interface StreamEmbedProps {
  videoId: string;
  title: string;
  autoplay?: boolean;
}

export default function StreamEmbed({
  videoId,
  title,
  autoplay = false,
}: StreamEmbedProps) {
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-brand-navy border border-white/[0.06]">
      <iframe
        src={getYouTubeEmbedUrl(videoId, autoplay)}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}

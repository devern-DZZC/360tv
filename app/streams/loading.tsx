import StreamSkeleton from "@/components/streams/StreamSkeleton";

export default function StreamsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 space-y-2">
        <div className="h-8 skeleton w-1/4" />
        <div className="h-4 skeleton w-2/5" />
      </div>

      {/* Filter bar skeleton */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-1 p-1 rounded-xl bg-surface-glass border border-white/[0.06]">
          <div className="h-9 w-16 skeleton rounded-lg" />
          <div className="h-9 w-16 skeleton rounded-lg" />
          <div className="h-9 w-20 skeleton rounded-lg" />
          <div className="h-9 w-14 skeleton rounded-lg" />
        </div>
      </div>

      <StreamSkeleton count={8} />
    </div>
  );
}

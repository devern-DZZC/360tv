import StreamSkeleton from "@/components/streams/StreamSkeleton";

export default function HomeLoading() {
  return (
    <div>
      {/* Hero skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="aspect-video skeleton rounded-xl mb-4" />
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="h-6 w-16 skeleton" />
            <div className="h-6 w-20 skeleton" />
          </div>
          <div className="h-7 skeleton w-3/5" />
          <div className="h-4 skeleton w-1/4" />
        </div>
      </div>

      {/* Upcoming section skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-6 skeleton w-1/5 mb-5" />
        <StreamSkeleton count={4} />
      </div>
    </div>
  );
}

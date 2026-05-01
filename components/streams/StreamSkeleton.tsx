export default function StreamSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl overflow-hidden border border-white/[0.06] bg-surface-glass"
          style={{ animation: `fade-in 0.3s ease-out ${i * 0.05}s both` }}
        >
          {/* Thumbnail skeleton */}
          <div className="aspect-video skeleton" />

          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            <div className="h-4 skeleton w-4/5" />
            <div className="h-4 skeleton w-3/5" />
            <div className="h-3 skeleton w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

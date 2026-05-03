import StreamSkeleton from "@/components/streams/StreamSkeleton";

export default function StreamsResultsSkeleton() {
  return (
    <div className="space-y-6">
      <StreamSkeleton count={12} />

      <div className="rounded-[1.5rem] border border-white/[0.06] bg-surface-glass p-4 backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-4 w-48 skeleton" />

          <div className="flex flex-wrap items-center gap-2">
            <div className="h-11 w-28 skeleton rounded-2xl" />
            <div className="h-11 w-11 skeleton rounded-2xl" />
            <div className="h-11 w-11 skeleton rounded-2xl" />
            <div className="h-11 w-11 skeleton rounded-2xl" />
            <div className="h-11 w-24 skeleton rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

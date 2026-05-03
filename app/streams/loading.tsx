import StreamsResultsSkeleton from "@/components/streams/StreamsResultsSkeleton";

export default function StreamsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 space-y-6">
        <div className="h-8 skeleton w-1/4" />
        <div className="h-4 skeleton w-2/5" />

        <div className="rounded-[1.75rem] border border-white/[0.06] bg-surface-glass p-5">
          <div className="h-3 w-32 skeleton mb-3" />
          <div className="h-4 w-72 skeleton mb-4" />
          <div className="h-14 w-full skeleton rounded-2xl" />
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1 rounded-2xl bg-surface-glass border border-white/[0.06] p-1.5">
            <div className="h-10 w-20 skeleton rounded-xl" />
            <div className="h-10 w-20 skeleton rounded-xl" />
            <div className="h-10 w-24 skeleton rounded-xl" />
            <div className="h-10 w-[4.5rem] skeleton rounded-xl" />
          </div>

          <div className="flex flex-wrap gap-1.5">
            <div className="h-10 w-24 skeleton rounded-full" />
            <div className="h-10 w-28 skeleton rounded-full" />
            <div className="h-10 w-28 skeleton rounded-full" />
          </div>
        </div>
      </div>

      <StreamsResultsSkeleton />
    </div>
  );
}

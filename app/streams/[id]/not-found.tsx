import Link from "next/link";

export default function StreamNotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center text-center animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-surface-glass flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-brand-offwhite-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
        </svg>
      </div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-brand-white mb-2">
        Stream Not Found
      </h1>
      <p className="text-brand-offwhite-dim text-sm mb-6">
        This stream doesn&apos;t exist or may have been removed.
      </p>
      <Link
        href="/streams"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-navy-light text-brand-white font-medium hover:bg-brand-navy-mid transition-colors text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Streams
      </Link>
    </div>
  );
}

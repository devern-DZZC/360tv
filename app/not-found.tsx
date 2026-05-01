import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-surface-glass flex items-center justify-center mb-6">
        <span className="font-[family-name:var(--font-display)] text-3xl font-bold text-brand-offwhite-dim">
          404
        </span>
      </div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-brand-white mb-2">
        Page Not Found
      </h1>
      <p className="text-brand-offwhite-dim text-sm mb-6 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-navy-light text-brand-white font-medium hover:bg-brand-navy-mid transition-colors text-sm"
      >
        Go Home
      </Link>
    </div>
  );
}

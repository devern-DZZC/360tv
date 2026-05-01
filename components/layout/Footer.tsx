import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="border-t border-white/[0.06] mt-auto"
      style={{ background: 'rgba(15, 22, 52, 0.9)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Image
              src="/360tv-logo.png"
              alt="360tv"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="font-[family-name:var(--font-display)] text-lg font-bold text-brand-white">
              360<span className="text-brand-offwhite-dim font-medium">tv</span>
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-brand-offwhite-dim">
            <Link
              href="/"
              className="hover:text-brand-white transition-colors"
            >
              Home
            </Link>
            <Link
              href="/streams"
              className="hover:text-brand-white transition-colors"
            >
              Streams
            </Link>
            <Link
              href="/streams?status=live"
              className="hover:text-brand-white transition-colors"
            >
              Live Now
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-xs text-brand-offwhite-dim/60">
            © {new Date().getFullYear()} 360tv. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

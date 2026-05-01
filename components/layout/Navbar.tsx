import Image from "next/image";
import Link from "next/link";
import { getStreamCounts } from "@/lib/services/stream-service";

export default async function Navbar() {
  let liveCount = 0;
  try {
    const counts = await getStreamCounts();
    liveCount = counts.live;
  } catch {
    // Fail silently — nav still renders
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06]" style={{ background: 'rgba(15, 22, 52, 0.85)', backdropFilter: 'blur(16px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/360tv-logo.png"
              alt="360tv"
              width={40}
              height={40}
              className="rounded-full transition-transform group-hover:scale-105"
              priority
            />
            <span className="font-[family-name:var(--font-display)] text-xl font-bold tracking-wide text-brand-white hidden sm:block">
              360<span className="text-brand-offwhite-dim font-medium">tv</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-2">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/streams">
              Streams
            </NavLink>
            {liveCount > 0 && (
              <Link
                href="/streams?status=live"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
                style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-live)' }}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className="absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ background: 'var(--accent-live)', animation: 'pulse-ring 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ background: 'var(--accent-live)' }}
                  />
                </span>
                {liveCount} LIVE
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="px-3 py-2 text-sm font-medium text-brand-offwhite hover:text-brand-white transition-colors rounded-lg hover:bg-white/[0.05]"
    >
      {children}
    </Link>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavbarClientProps {
  liveCount: number;
}

export default function NavbarClient({ liveCount }: NavbarClientProps) {
  const pathname = usePathname();

  return (
    <nav
      className="sticky top-0 z-50 border-b border-white/[0.06]"
      style={{ background: "rgba(15, 22, 52, 0.85)", backdropFilter: "blur(16px)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/360tv-logo.png"
              alt="360tv"
              width={40}
              height={40}
              className="rounded-full transition-transform group-hover:scale-105"
              priority
            />
            <span className="hidden text-xl font-bold tracking-wide text-brand-white sm:block font-[family-name:var(--font-display)]">
              360<span className="font-medium text-brand-offwhite-dim">tv</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 sm:gap-2">
              <NavItem href="/" label="Home" isActive={pathname === "/"} />
              <NavItem
                href="/streams"
                label="Streams"
                isActive={pathname === "/streams" || pathname.startsWith("/streams/")}
              />
            </div>

            {liveCount > 0 && (
              <Link
                href="/streams?status=live"
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-all hover:scale-105"
                style={{ background: "rgba(239, 68, 68, 0.15)", color: "var(--accent-live)" }}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className="absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ background: "var(--accent-live)", animation: "pulse-ring 1.5s cubic-bezier(0, 0, 0.2, 1) infinite" }}
                  />
                  <span
                    className="relative inline-flex h-2 w-2 rounded-full"
                    style={{ background: "var(--accent-live)" }}
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

function NavItem({
  href,
  label,
  isActive,
}: {
  href: string;
  label: string;
  isActive: boolean;
}) {
  if (isActive) {
    return (
      <span
        aria-current="page"
        className="relative inline-flex items-center px-3 py-2 text-sm font-semibold text-brand-white"
      >
        {label}
        <span
          aria-hidden="true"
          className="absolute inset-x-3 -bottom-[0.35rem] h-[2px] rounded-full bg-brand-white/85"
        />
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "relative inline-flex items-center px-3 py-2 text-sm font-medium text-brand-offwhite-dim transition-colors",
        "hover:text-brand-white"
      )}
    >
      {label}
    </Link>
  );
}

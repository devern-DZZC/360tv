import Link from "next/link";
import StreamHero from "@/components/streams/StreamHero";
import StreamGrid from "@/components/streams/StreamGrid";
import {
  getFeaturedStreams,
  getUpcomingStreams,
  getPastStreams,
} from "@/lib/services/stream-service";

export const revalidate = 300; // ISR: 5 minutes

export default async function HomePage() {
  const [featured, upcoming, past] = await Promise.all([
    getFeaturedStreams(3),
    getUpcomingStreams(4),
    getPastStreams(4),
  ]);

  // Don't show featured streams again in upcoming or past sections
  const featuredIds = new Set(featured.map((s) => s.id));
  const upcomingFiltered = upcoming.filter((s) => !featuredIds.has(s.id));
  const pastFiltered = past.filter((s) => !featuredIds.has(s.id));

  return (
    <div>
      {/* Hero */}
      <StreamHero featured={featured} />

      {/* Upcoming Streams */}
      {upcomingFiltered.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SectionHeader title="Upcoming Streams" href="/streams?status=upcoming" />
          <StreamGrid streams={upcomingFiltered} />
        </section>
      )}

      {/* Recent Past Streams */}
      {pastFiltered.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SectionHeader title="Recent Streams" href="/streams?status=past" />
          <StreamGrid streams={pastFiltered} />
        </section>
      )}

      {/* CTA if everything is empty */}
      {featured.length === 0 && upcomingFiltered.length === 0 && pastFiltered.length === 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="glass-surface rounded-2xl p-10 max-w-lg mx-auto animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-brand-navy-light flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-brand-offwhite" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-brand-white mb-2">
              No Streams Yet
            </h2>
            <p className="text-brand-offwhite-dim text-sm mb-4">
              Streams will appear here once they are synced from YouTube. If you&apos;re an admin, trigger a sync to get started.
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-navy-light text-brand-white text-sm font-medium hover:bg-brand-navy-mid transition-colors"
            >
              Go to Admin
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="font-[family-name:var(--font-display)] text-lg sm:text-xl font-bold text-brand-white tracking-wide">
        {title}
      </h2>
      <Link
        href={href}
        className="text-sm text-brand-offwhite-dim hover:text-brand-white transition-colors flex items-center gap-1"
      >
        View All
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}

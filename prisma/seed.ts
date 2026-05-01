// 360tv — Database Seed Script
// Populates the database with sample stream data for development.
// Run with: npx tsx prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ log: ['error'] });

const sampleStreams = [
  {
    youtubeVideoId: 'sample_live_cricket_1',
    title: 'West Indies vs India — 2nd T20I Live',
    description: 'Watch the 2nd T20 International between West Indies and India live from Queen\'s Park Oval, Port of Spain.',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    thumbnailHigh: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    channelId: 'UC_sample_channel',
    channelTitle: '360tv',
    status: 'LIVE',
    sport: 'CRICKET',
    scheduledStartTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    actualStartTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
    actualEndTime: null,
    liveBroadcastContent: 'live',
    concurrentViewers: 1243,
  },
  {
    youtubeVideoId: 'sample_live_football_1',
    title: 'Trinidad & Tobago vs Jamaica — World Cup Qualifier',
    description: 'CONCACAF World Cup qualifying match between Trinidad & Tobago and Jamaica.',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    thumbnailHigh: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    channelId: 'UC_sample_channel',
    channelTitle: '360tv',
    status: 'LIVE',
    sport: 'FOOTBALL',
    scheduledStartTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
    actualStartTime: new Date(Date.now() - 0.75 * 60 * 60 * 1000),
    actualEndTime: null,
    liveBroadcastContent: 'live',
    concurrentViewers: 856,
  },
  {
    youtubeVideoId: 'sample_upcoming_cricket_1',
    title: 'CPL 2026: Trinbago Knight Riders vs St Lucia Kings',
    description: 'Caribbean Premier League match between TKR and St Lucia Kings at the Brian Lara Cricket Academy.',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    thumbnailHigh: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    channelId: 'UC_sample_channel',
    channelTitle: '360tv',
    status: 'UPCOMING',
    sport: 'CRICKET',
    scheduledStartTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    actualStartTime: null,
    actualEndTime: null,
    liveBroadcastContent: 'upcoming',
    concurrentViewers: null,
  },
  {
    youtubeVideoId: 'sample_upcoming_football_1',
    title: 'Manchester United vs Chelsea — Premier League',
    description: 'Premier League matchday 34. Manchester United host Chelsea at Old Trafford.',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    thumbnailHigh: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    channelId: 'UC_sample_channel',
    channelTitle: '360tv',
    status: 'UPCOMING',
    sport: 'FOOTBALL',
    scheduledStartTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    actualStartTime: null,
    actualEndTime: null,
    liveBroadcastContent: 'upcoming',
    concurrentViewers: null,
  },
  {
    youtubeVideoId: 'sample_upcoming_cricket_2',
    title: 'India vs England — 3rd ODI',
    description: 'Third and final One Day International between India and England.',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    thumbnailHigh: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    channelId: 'UC_sample_channel',
    channelTitle: '360tv',
    status: 'UPCOMING',
    sport: 'CRICKET',
    scheduledStartTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // 2 days
    actualStartTime: null,
    actualEndTime: null,
    liveBroadcastContent: 'upcoming',
    concurrentViewers: null,
  },
  {
    youtubeVideoId: 'sample_past_cricket_1',
    title: 'West Indies vs India — 1st T20I Highlights',
    description: 'Full match highlights of the first T20 International.',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    thumbnailHigh: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    channelId: 'UC_sample_channel',
    channelTitle: '360tv',
    status: 'PAST',
    sport: 'CRICKET',
    scheduledStartTime: new Date(Date.now() - 48 * 60 * 60 * 1000),
    actualStartTime: new Date(Date.now() - 47 * 60 * 60 * 1000),
    actualEndTime: new Date(Date.now() - 44 * 60 * 60 * 1000),
    liveBroadcastContent: 'none',
    viewCount: 45200,
    concurrentViewers: null,
  },
  {
    youtubeVideoId: 'sample_past_football_1',
    title: 'Barcelona vs Real Madrid — El Clásico Full Match',
    description: 'La Liga El Clásico at Camp Nou. What a match!',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    thumbnailHigh: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    channelId: 'UC_sample_channel',
    channelTitle: '360tv',
    status: 'PAST',
    sport: 'FOOTBALL',
    scheduledStartTime: new Date(Date.now() - 72 * 60 * 60 * 1000),
    actualStartTime: new Date(Date.now() - 71 * 60 * 60 * 1000),
    actualEndTime: new Date(Date.now() - 69 * 60 * 60 * 1000),
    liveBroadcastContent: 'none',
    viewCount: 128000,
    concurrentViewers: null,
  },
  {
    youtubeVideoId: 'sample_past_cricket_2',
    title: 'CPL 2026: Jamaica Tallawahs vs Guyana Amazon Warriors',
    description: 'Caribbean Premier League match highlights.',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    thumbnailHigh: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    channelId: 'UC_sample_channel',
    channelTitle: '360tv',
    status: 'PAST',
    sport: 'CRICKET',
    scheduledStartTime: new Date(Date.now() - 96 * 60 * 60 * 1000),
    actualStartTime: new Date(Date.now() - 95 * 60 * 60 * 1000),
    actualEndTime: new Date(Date.now() - 92 * 60 * 60 * 1000),
    liveBroadcastContent: 'none',
    viewCount: 23500,
    concurrentViewers: null,
  },
  {
    youtubeVideoId: 'sample_past_football_2',
    title: 'Arsenal vs Liverpool — Premier League',
    description: 'Premier League top-of-the-table clash at Emirates Stadium.',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    thumbnailHigh: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    channelId: 'UC_sample_channel',
    channelTitle: '360tv',
    status: 'PAST',
    sport: 'FOOTBALL',
    scheduledStartTime: new Date(Date.now() - 120 * 60 * 60 * 1000),
    actualStartTime: new Date(Date.now() - 119 * 60 * 60 * 1000),
    actualEndTime: new Date(Date.now() - 117 * 60 * 60 * 1000),
    liveBroadcastContent: 'none',
    viewCount: 89300,
    concurrentViewers: null,
  },
];

async function seed() {
  console.log('🌱 Seeding database...\n');

  for (const stream of sampleStreams) {
    await prisma.stream.upsert({
      where: { youtubeVideoId: stream.youtubeVideoId },
      create: stream,
      update: stream,
    });
    console.log(`  ✓ ${stream.status.padEnd(9)} ${stream.sport.padEnd(10)} ${stream.title}`);
  }

  console.log(`\n✅ Seeded ${sampleStreams.length} streams`);

  const counts = {
    live: await prisma.stream.count({ where: { status: 'LIVE' } }),
    upcoming: await prisma.stream.count({ where: { status: 'UPCOMING' } }),
    past: await prisma.stream.count({ where: { status: 'PAST' } }),
  };
  console.log(`   Live: ${counts.live}, Upcoming: ${counts.upcoming}, Past: ${counts.past}`);
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

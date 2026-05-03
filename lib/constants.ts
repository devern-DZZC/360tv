// ============================================================
// 360tv — Application Constants
// ============================================================

// YouTube API
export const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
export const YOUTUBE_MAX_RESULTS = 50; // Max items per API call
export const YOUTUBE_API_RETRY_COUNT = 3;
export const YOUTUBE_API_RETRY_DELAY_MS = 1000; // Base delay (doubled each retry)
export const YOUTUBE_API_CALL_DELAY_MS = 100; // Delay between consecutive calls
export const YOUTUBE_API_TIMEOUT_MS = 15000; // 15 second timeout

// Sync
export const SYNC_LOCK_TIMEOUT_MINUTES = 10; // Consider stale RUNNING syncs as failed
export const CANCELLED_THRESHOLD_HOURS = 24; // Hours past scheduled start before marking CANCELLED

// Pagination
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;

// Caching / ISR
export const REVALIDATE_LISTING = 300;  // 5 minutes
export const REVALIDATE_DETAIL = 600;   // 10 minutes
export const CLIENT_REFRESH_INTERVAL_MS = 60000; // 60 seconds for live/upcoming SWR

// Sport Detection Keywords
export const CRICKET_KEYWORDS = [
  'cricket', 'test match', 't20', 'odi', 'ipl', 'cpl', 'ttcl', 'sscl',
  'world cup cricket', 'wicket', 'innings', 'over',
  'batsman', 'bowler', 'crease', 'bcci', 'cwi',
  'twenty20', 'one day', 'six', 'boundary', 'stumps',
  'lbw', 'run out', 'maiden', 'hat-trick', 'duck',
];

export const FOOTBALL_KEYWORDS = [
  'football', 'soccer', 'fifa', 'premier league', 'ssfl',
  'la liga', 'champions league', 'goal', 'penalty',
  'halftime', 'half-time', 'match day', 'kickoff',
  'kick-off', 'offside', 'red card', 'yellow card',
  'free kick', 'corner kick', 'extra time', 'stoppage',
];

// Brand Colors (also set in Tailwind config)
export const BRAND = {
  navy: '#1a2456',
  navyDeep: '#0f1634',
  navyLight: '#2a3a7c',
  white: '#ffffff',
  offWhite: '#e8ecf4',
  accentLive: '#ef4444',
  accentUpcoming: '#f59e0b',
  accentPast: '#6b7280',
  accentCricket: '#22c55e',
  accentFootball: '#3b82f6',
} as const;

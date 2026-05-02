// ============================================================
// 360tv — RSS Service
// Handles fetching and parsing public YouTube RSS feeds
// to detect channel changes for zero-quota polling.
// ============================================================

import { XMLParser } from 'fast-xml-parser';

export interface RSSVideoResult {
  videoId: string;
  updated: Date;
  published: Date;
}

export async function fetchChannelRSS(channelId: string): Promise<RSSVideoResult[]> {
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

  // Use next cache parameters to ensure we do not cache the external request during cron polling
  const res = await fetch(rssUrl, { cache: 'no-store' });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch YouTube RSS for channel ${channelId}`);
  }

  const xmlText = await res.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });

  const parsed = parser.parse(xmlText);

  // The feed might be entirely empty if there are no public videos
  if (!parsed.feed || !parsed.feed.entry) {
    return [];
  }

  const entries = Array.isArray(parsed.feed.entry) 
    ? parsed.feed.entry 
    : [parsed.feed.entry]; // Handle single entry case which parses as an object

  const results: RSSVideoResult[] = entries.map((entry: any) => {
    // The `<yt:videoId>` tag parses as `yt:videoId` property
    return {
      videoId: entry['yt:videoId'],
      updated: new Date(entry.updated),
      published: new Date(entry.published),
    };
  });

  return results.filter(v => v.videoId && v.updated);
}

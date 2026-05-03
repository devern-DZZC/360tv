// ============================================================
// 360tv — Sport Detection Utility
// Infers sport type from video title and description using
// keyword matching with title-priority heuristic.
// ============================================================

import type { Sport } from '@/lib/types';
import { CRICKET_KEYWORDS, FOOTBALL_KEYWORDS } from '@/lib/constants';

const TITLE_PRIORITY_FOOTBALL_KEYWORDS = ['ssfl'];
const TITLE_PRIORITY_CRICKET_KEYWORDS = ['t20', 'ttcl', 'sscl', 'over', 'overs'];

/**
 * Detect sport type from title and description.
 * Title matches take priority over description matches.
 * If both sports match, title match wins; if both in title, cricket wins (arbitrary tiebreak).
 */
export function detectSport(title: string, description?: string | null): Sport {
  const titleLower = title.toLowerCase();
  const descLower = (description || '').toLowerCase();
  const priorityFootballInTitle = TITLE_PRIORITY_FOOTBALL_KEYWORDS.some((kw) => titleLower.includes(kw));
  const priorityCricketInTitle = TITLE_PRIORITY_CRICKET_KEYWORDS.some((kw) => titleLower.includes(kw));

  // Explicit title rules for local competition abbreviations and cricket shorthand.
  if (priorityFootballInTitle && !priorityCricketInTitle) return 'FOOTBALL';
  if (priorityCricketInTitle && !priorityFootballInTitle) return 'CRICKET';
  if (priorityFootballInTitle && priorityCricketInTitle) return 'FOOTBALL';

  const cricketInTitle = CRICKET_KEYWORDS.some((kw) => titleLower.includes(kw));
  const footballInTitle = FOOTBALL_KEYWORDS.some((kw) => titleLower.includes(kw));

  // Clear title match
  if (cricketInTitle && !footballInTitle) return 'CRICKET';
  if (footballInTitle && !cricketInTitle) return 'FOOTBALL';

  // Both in title — cricket wins (arbitrary tiebreak)
  if (cricketInTitle && footballInTitle) return 'CRICKET';

  // Check description as fallback
  const cricketInDesc = CRICKET_KEYWORDS.some((kw) => descLower.includes(kw));
  const footballInDesc = FOOTBALL_KEYWORDS.some((kw) => descLower.includes(kw));

  if (cricketInDesc && !footballInDesc) return 'CRICKET';
  if (footballInDesc && !cricketInDesc) return 'FOOTBALL';

  return 'UNKNOWN';
}

// ============================================================
// 360tv — Stream Classification Engine
// Pure function: takes video data, returns stream status.
// Single source of truth for status determination.
// ============================================================

import type { StreamStatus } from '@/lib/types';
import { CANCELLED_THRESHOLD_HOURS } from '@/lib/constants';

interface ClassificationInput {
  liveBroadcastContent?: string | null;
  scheduledStartTime?: string | Date | null;
  actualStartTime?: string | Date | null;
  actualEndTime?: string | Date | null;
}

export type ClassificationResult =
  | { status: StreamStatus; skip: false }
  | { status: null; skip: true; reason: string };

/**
 * Classify a stream's status based on YouTube metadata.
 *
 * Decision order (highest precedence first):
 * 1. liveBroadcastContent === "live" AND actualStartTime exists AND no actualEndTime → LIVE
 * 2. actualEndTime exists → PAST
 * 3. actualStartTime exists AND no actualEndTime → LIVE
 * 4. scheduledStartTime exists AND no actualStartTime:
 *    - If overdue by 24+ hours → CANCELLED
 *    - Otherwise → UPCOMING
 * 5. No liveStreamingDetails at all → SKIP (not a broadcast)
 * 6. Fallback → UPCOMING
 */
export function classifyStream(input: ClassificationInput): ClassificationResult {
  const {
    liveBroadcastContent,
    scheduledStartTime,
    actualStartTime,
    actualEndTime,
  } = input;

  // No live streaming data at all — this is a regular video, not a broadcast
  const hasAnyLiveData = liveBroadcastContent || scheduledStartTime || actualStartTime || actualEndTime;
  if (!hasAnyLiveData) {
    return { status: null, skip: true, reason: 'No liveStreamingDetails — regular video' };
  }

  // 1. YouTube says it's live AND we have confirmation
  if (
    liveBroadcastContent === 'live' &&
    actualStartTime &&
    !actualEndTime
  ) {
    return { status: 'LIVE', skip: false };
  }

  // 2. Has an end time — it's over
  if (actualEndTime) {
    return { status: 'PAST', skip: false };
  }

  // 3. Has started but no end time — must be live
  if (actualStartTime && !actualEndTime) {
    return { status: 'LIVE', skip: false };
  }

  // 4. Scheduled but not started
  if (scheduledStartTime && !actualStartTime) {
    const scheduled = new Date(scheduledStartTime);
    const now = new Date();
    const hoursSinceScheduled = (now.getTime() - scheduled.getTime()) / (1000 * 60 * 60);

    if (hoursSinceScheduled > CANCELLED_THRESHOLD_HOURS) {
      return { status: 'CANCELLED', skip: false };
    }
    return { status: 'UPCOMING', skip: false };
  }

  // 5. liveBroadcastContent is "upcoming" but no scheduledStartTime
  if (liveBroadcastContent === 'upcoming') {
    return { status: 'UPCOMING', skip: false };
  }

  // 6. liveBroadcastContent is "none" with no other data — completed or regular video
  if (liveBroadcastContent === 'none') {
    return { status: 'PAST', skip: false };
  }

  // 7. Fallback
  return { status: 'UPCOMING', skip: false };
}

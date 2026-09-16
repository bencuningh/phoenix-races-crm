import { env } from "@/lib/env";
import type { FollowupReason } from "@/types/contact";

function daysBetween(isoDate: string, now: Date): number {
  const then = new Date(`${isoDate}T00:00:00Z`).getTime();
  const diffMs = now.getTime() - then;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/** Keeps the more recent of two possibly-null ISO date strings (YYYY-MM-DD). */
export function maxIsoDate(...dates: (string | null | undefined)[]): string | null {
  const valid = dates.filter((d): d is string => Boolean(d));
  if (valid.length === 0) return null;
  return valid.reduce((latest, current) => (current > latest ? current : latest));
}

export interface FollowupComputation {
  daysSinceContact: number | null;
  needsFollowup: boolean;
  followupReason: FollowupReason | null;
}

/**
 * Computes follow-up status for a contact.
 *
 * - No `lastReach` at all → never contacted, top priority.
 * - `lastReach` older than the threshold, and I sent the last message (per Gmail) → awaiting_reply.
 * - `lastReach` older than the threshold otherwise → silence.
 */
export function computeFollowup(
  lastReach: string | null,
  gmail: { lastSent: string | null; lastReceived: string | null } = {
    lastSent: null,
    lastReceived: null,
  },
  now: Date = new Date(),
): FollowupComputation {
  if (!lastReach) {
    return { daysSinceContact: null, needsFollowup: true, followupReason: "never_contacted" };
  }

  const daysSinceContact = daysBetween(lastReach, now);
  if (daysSinceContact <= env.followupThresholdDays) {
    return { daysSinceContact, needsFollowup: false, followupReason: null };
  }

  const iSentLast =
    Boolean(gmail.lastSent) &&
    (!gmail.lastReceived || gmail.lastSent! > gmail.lastReceived!);

  return {
    daysSinceContact,
    needsFollowup: true,
    followupReason: iSentLast ? "awaiting_reply" : "silence",
  };
}

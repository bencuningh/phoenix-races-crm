import { env } from "@/lib/env";
import type { CachedContactRow, FollowupReason } from "@/types/contact";

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
  thresholdDays: number = env.followupThresholdDays,
): FollowupComputation {
  if (!lastReach) {
    return { daysSinceContact: null, needsFollowup: true, followupReason: "never_contacted" };
  }

  const daysSinceContact = daysBetween(lastReach, now);
  if (daysSinceContact <= thresholdDays) {
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

/**
 * Re-derives `needs_followup` from an already-cached `days_since_contact` against a
 * (possibly just-changed) threshold, without needing a fresh Gmail cross-check.
 */
export function recomputeNeedsFollowup(daysSinceContact: number | null, thresholdDays: number): boolean {
  return daysSinceContact === null || daysSinceContact > thresholdDays;
}

/** True if a contact is paused indefinitely or snoozed to a future date — hidden from "à relancer" and the digest. */
export function isSnoozed(contact: Pick<CachedContactRow, "standby" | "snooze_until">, today: Date = new Date()): boolean {
  if (contact.standby) return true;
  if (!contact.snooze_until) return false;
  return contact.snooze_until > today.toISOString().slice(0, 10);
}

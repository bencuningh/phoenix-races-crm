export type FollowupReason = "never_contacted" | "awaiting_reply" | "silence";

/** Contact as read straight from the Notion "Phoenix Races — Contacts" database. */
export interface NotionContact {
  notionPageId: string;
  name: string;
  company: string | null;
  /** Combined role · sector classification, e.g. "Partner · Nutrition". */
  type: string | null;
  email: string | null;
  linkedin: string | null;
  phone: string | null;
  /** ISO date string (YYYY-MM-DD), or null if "Last Reach" is empty. */
  lastReach: string | null;
}

/** Result of crossing a single contact's email against Gmail threads. */
export interface GmailCrossResult {
  /** ISO date of the most recent message I sent to this contact. */
  lastSent: string | null;
  /** ISO date of the most recent message received from this contact. */
  lastReceived: string | null;
}

/** Fully enriched contact, ready to cache in Supabase. */
export interface EnrichedContact extends NotionContact {
  isCompanyRow: boolean;
  needsQualification: boolean;
  daysSinceContact: number | null;
  needsFollowup: boolean;
  followupReason: FollowupReason | null;
  /** Most recent Gmail message date (sent or received) with this contact, or null. */
  lastEmailContact: string | null;
  /** Per-contact override of the follow-up threshold (days), or null to use the global default. */
  followupThresholdDays: number | null;
}

/** Row shape as read back from the `contacts_cache` Supabase table (snake_case). */
export interface CachedContactRow {
  id: string;
  notion_page_id: string;
  name: string;
  company: string | null;
  type: string | null;
  email: string | null;
  linkedin: string | null;
  phone: string | null;
  last_reach: string | null;
  last_email_contact: string | null;
  is_company_row: boolean;
  days_since_contact: number | null;
  needs_followup: boolean;
  followup_reason: FollowupReason | null;
  needs_qualification: boolean;
  standby: boolean;
  snooze_until: string | null;
  followup_threshold_days: number | null;
  updated_at: string;
}

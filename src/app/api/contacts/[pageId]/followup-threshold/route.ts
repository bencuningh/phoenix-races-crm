import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { env } from "@/lib/env";
import { recomputeNeedsFollowup } from "@/lib/followup";
import { getErrorMessage } from "@/lib/errors";
import type { CachedContactRow } from "@/types/contact";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> },
) {
  const { pageId } = await params;
  const body = await request.json().catch(() => null);
  const raw = body?.followup_threshold_days;

  if (raw !== null && (typeof raw !== "number" || !Number.isInteger(raw) || raw <= 0)) {
    return NextResponse.json(
      { error: "followup_threshold_days must be a positive integer or null" },
      { status: 400 },
    );
  }

  try {
    const supabase = createServiceClient();

    const { data: contact, error: fetchError } = await supabase
      .from("contacts_cache")
      .select("days_since_contact, followup_reason")
      .eq("notion_page_id", pageId)
      .maybeSingle<Pick<CachedContactRow, "days_since_contact" | "followup_reason">>();
    if (fetchError) throw fetchError;
    if (!contact) {
      return NextResponse.json({ error: "Contact introuvable" }, { status: 404 });
    }

    const effectiveThreshold = raw ?? env.followupThresholdDays;
    const needsFollowup = recomputeNeedsFollowup(contact.days_since_contact, effectiveThreshold);
    // Reason distinguishes "awaiting_reply" vs "silence" using Gmail data we don't
    // have here — best-effort now, corrected on the next sync.
    const followupReason = !needsFollowup
      ? null
      : (contact.followup_reason ?? (contact.days_since_contact === null ? "never_contacted" : "silence"));

    const { error } = await supabase
      .from("contacts_cache")
      .update({
        followup_threshold_days: raw,
        needs_followup: needsFollowup,
        followup_reason: followupReason,
        updated_at: new Date().toISOString(),
      })
      .eq("notion_page_id", pageId);
    if (error) throw error;

    return NextResponse.json({ ok: true, followup_threshold_days: raw });
  } catch (err) {
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

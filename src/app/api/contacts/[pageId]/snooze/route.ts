import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> },
) {
  const { pageId } = await params;
  const body = await request.json().catch(() => null);
  const snoozeUntil = body?.snooze_until;

  if (snoozeUntil !== null && typeof snoozeUntil !== "string") {
    return NextResponse.json({ error: "snooze_until must be a date string or null" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("contacts_cache")
    .update({ snooze_until: snoozeUntil, updated_at: new Date().toISOString() })
    .eq("notion_page_id", pageId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, snooze_until: snoozeUntil });
}

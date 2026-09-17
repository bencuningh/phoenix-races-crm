import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getAuthorizedGmailClient } from "@/lib/gmail/oauth";
import { getRecentThreadHistory, type EmailHistoryItem } from "@/lib/gmail/search";
import { generateFollowupDraft } from "@/lib/claude";
import { getErrorMessage } from "@/lib/errors";
import type { CachedContactRow } from "@/types/contact";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> },
) {
  const { pageId } = await params;
  const supabase = createServiceClient();

  const { data: contact, error } = await supabase
    .from("contacts_cache")
    .select("*")
    .eq("notion_page_id", pageId)
    .maybeSingle<CachedContactRow>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!contact) {
    return NextResponse.json({ error: "Contact introuvable" }, { status: 404 });
  }

  let history: EmailHistoryItem[] = [];
  if (contact.email) {
    try {
      const gmailClient = await getAuthorizedGmailClient();
      history = await getRecentThreadHistory(gmailClient, contact.email);
    } catch {
      // Gmail not connected or lookup failed — fall back to no history rather than failing the draft.
      history = [];
    }
  }

  try {
    const draft = await generateFollowupDraft(contact, history);
    return NextResponse.json(draft);
  } catch (err) {
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

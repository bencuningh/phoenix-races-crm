import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase";
import { getAuthorizedGmailClient } from "@/lib/gmail/oauth";
import { sendSelfEmail } from "@/lib/gmail/send";
import { isSnoozed } from "@/lib/followup";
import { getErrorMessage } from "@/lib/errors";
import type { CachedContactRow } from "@/types/contact";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const REASON_LABEL: Record<string, string> = {
  never_contacted: "Jamais contacté",
  awaiting_reply: "Sans réponse",
  silence: "Silence",
};

function sortFollowup(a: CachedContactRow, b: CachedContactRow): number {
  const aNever = a.followup_reason === "never_contacted";
  const bNever = b.followup_reason === "never_contacted";
  if (aNever !== bNever) return aNever ? -1 : 1;
  return (b.days_since_contact ?? 0) - (a.days_since_contact ?? 0);
}

function formatDigest(contacts: CachedContactRow[]): string {
  if (contacts.length === 0) {
    return "Personne à relancer cette semaine — tout est à jour ou en stand-by. 🎉";
  }
  const lines = contacts.map((c) => {
    const reason = c.followup_reason ? REASON_LABEL[c.followup_reason] : "?";
    const days = c.days_since_contact !== null ? `${c.days_since_contact}j` : "jamais";
    const company = c.company && c.company !== c.name ? ` (${c.company})` : "";
    return `- ${c.name}${company} — ${reason}, dernier contact: ${days}`;
  });
  return `${contacts.length} contact(s) à relancer cette semaine :\n\n${lines.join("\n")}\n\nhttps://phoenix-races-crm.vercel.app`;
}

export async function GET(request: NextRequest) {
  if (env.cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${env.cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("contacts_cache")
      .select("*")
      .eq("needs_followup", true);
    if (error) throw error;

    const contacts = ((data ?? []) as CachedContactRow[])
      .filter((c) => !isSnoozed(c))
      .sort(sortFollowup);
    const body = formatDigest(contacts);

    const gmailClient = await getAuthorizedGmailClient();
    await sendSelfEmail(gmailClient, `Phoenix Races — ${contacts.length} contact(s) à relancer`, body);

    return NextResponse.json({ ok: true, contactsCount: contacts.length });
  } catch (err) {
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

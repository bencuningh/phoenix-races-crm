import { fetchContacts, updateLastReach } from "@/lib/notion";
import { getAuthorizedGmailClient } from "@/lib/gmail/oauth";
import { crossContactWithGmail } from "@/lib/gmail/search";
import { computeFollowup, maxIsoDate } from "@/lib/followup";
import { createServiceClient } from "@/lib/supabase";
import type { EnrichedContact, GmailCrossResult, NotionContact } from "@/types/contact";

function isCompanyRow(contact: NotionContact): boolean {
  if (!contact.company) return false;
  return contact.name.trim().toLowerCase() === contact.company.trim().toLowerCase();
}

function companyKey(company: string | null): string | null {
  return company ? company.trim().toLowerCase() : null;
}

export interface SyncResult {
  status: "success" | "partial" | "error";
  contactsProcessed: number;
  contactsUpdated: number;
  errors: { contact: string; message: string }[];
}

export async function runSync(trigger: "cron" | "manual"): Promise<SyncResult> {
  const supabase = createServiceClient();
  const { data: logRow, error: logInsertError } = await supabase
    .from("sync_log")
    .insert({ trigger, status: "running" })
    .select("id")
    .single();
  if (logInsertError) throw logInsertError;
  const syncLogId = logRow.id as string;

  const errors: { contact: string; message: string }[] = [];
  let contactsUpdated = 0;

  try {
    const contacts = await fetchContacts();

    // Gmail is optional at this stage: if it isn't connected yet, we still
    // cache Notion data and compute follow-up from the manually-set Last Reach.
    let gmailClient: Awaited<ReturnType<typeof getAuthorizedGmailClient>> | null = null;
    try {
      gmailClient = await getAuthorizedGmailClient();
    } catch (err) {
      errors.push({
        contact: "(gmail)",
        message: err instanceof Error ? err.message : String(err),
      });
    }

    const gmailByPageId = new Map<string, GmailCrossResult>();

    // Step 1: cross each emailed contact with Gmail, and push newer dates back to Notion.
    for (const contact of contacts) {
      if (!contact.email || !gmailClient) continue;
      try {
        const cross = await crossContactWithGmail(gmailClient, contact.email);
        gmailByPageId.set(contact.notionPageId, cross);

        const crossedLastReach = maxIsoDate(contact.lastReach, cross.lastSent, cross.lastReceived);
        if (crossedLastReach && crossedLastReach !== contact.lastReach) {
          await updateLastReach(contact.notionPageId, crossedLastReach);
          contact.lastReach = crossedLastReach;
          contactsUpdated += 1;
        }
      } catch (err) {
        errors.push({
          contact: contact.name,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }

    // Step 2: company placeholder rows inherit the most recent Last Reach among
    // the real people at that company (cache/display only, never written to Notion).
    const companyMaxLastReach = new Map<string, string | null>();
    for (const contact of contacts) {
      if (isCompanyRow(contact)) continue;
      const key = companyKey(contact.company);
      if (!key) continue;
      companyMaxLastReach.set(key, maxIsoDate(companyMaxLastReach.get(key), contact.lastReach));
    }

    // Step 3: enrich every contact and upsert into the Supabase cache.
    const enriched: EnrichedContact[] = contacts.map((contact) => {
      const companyRow = isCompanyRow(contact);
      const effectiveLastReach = companyRow
        ? maxIsoDate(contact.lastReach, companyMaxLastReach.get(companyKey(contact.company) ?? ""))
        : contact.lastReach;

      const gmail = gmailByPageId.get(contact.notionPageId) ?? {
        lastSent: null,
        lastReceived: null,
      };
      const { daysSinceContact, needsFollowup, followupReason } = computeFollowup(
        effectiveLastReach,
        gmail,
      );

      return {
        ...contact,
        lastReach: effectiveLastReach,
        isCompanyRow: companyRow,
        needsQualification: !contact.email,
        daysSinceContact,
        needsFollowup,
        followupReason,
        lastEmailContact: maxIsoDate(gmail.lastSent, gmail.lastReceived),
      };
    });

    const { error: upsertError } = await supabase.from("contacts_cache").upsert(
      enriched.map((c) => ({
        notion_page_id: c.notionPageId,
        name: c.name,
        company: c.company,
        type: c.type,
        email: c.email,
        linkedin: c.linkedin,
        phone: c.phone,
        last_reach: c.lastReach,
        last_email_contact: c.lastEmailContact,
        is_company_row: c.isCompanyRow,
        days_since_contact: c.daysSinceContact,
        needs_followup: c.needsFollowup,
        followup_reason: c.followupReason,
        needs_qualification: c.needsQualification,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: "notion_page_id" },
    );
    if (upsertError) throw upsertError;

    // Drop cached contacts that no longer exist in Notion.
    const currentPageIds = contacts.map((c) => c.notionPageId);
    if (currentPageIds.length > 0) {
      await supabase.from("contacts_cache").delete().not("notion_page_id", "in", `(${currentPageIds.map((id) => `"${id}"`).join(",")})`);
    }

    const status: SyncResult["status"] = errors.length === 0 ? "success" : "partial";
    await supabase
      .from("sync_log")
      .update({
        status,
        finished_at: new Date().toISOString(),
        contacts_processed: contacts.length,
        contacts_updated: contactsUpdated,
        errors: errors.length > 0 ? errors : null,
      })
      .eq("id", syncLogId);

    return { status, contactsProcessed: contacts.length, contactsUpdated, errors };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await supabase
      .from("sync_log")
      .update({
        status: "error",
        finished_at: new Date().toISOString(),
        contacts_updated: contactsUpdated,
        errors: [...errors, { contact: "(sync)", message }],
      })
      .eq("id", syncLogId);
    throw err;
  }
}

import { google, gmail_v1 } from "googleapis";
import type { OAuth2Client } from "google-auth-library";
import type { GmailCrossResult } from "@/types/contact";

function toIsoDate(internalDate: string | null | undefined): string | null {
  if (!internalDate) return null;
  const ms = Number.parseInt(internalDate, 10);
  if (!Number.isFinite(ms)) return null;
  return new Date(ms).toISOString().slice(0, 10);
}

/** Gmail search results are newest-first, so the top hit is the most recent message. */
async function latestMessageDate(
  gmail: gmail_v1.Gmail,
  query: string,
): Promise<string | null> {
  const list = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults: 1,
  });
  const messageId = list.data.messages?.[0]?.id;
  if (!messageId) return null;

  const message = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "metadata",
    metadataHeaders: ["Date"],
  });
  return toIsoDate(message.data.internalDate);
}

/**
 * Finds the most recent sent-to and received-from dates for a contact's email address,
 * scoped to the authenticated user's own mailbox.
 */
export async function crossContactWithGmail(
  auth: OAuth2Client,
  email: string,
): Promise<GmailCrossResult> {
  const gmail = google.gmail({ version: "v1", auth });
  const sanitized = email.replace(/"/g, '\\"');

  const [lastSent, lastReceived] = await Promise.all([
    latestMessageDate(gmail, `to:"${sanitized}"`),
    latestMessageDate(gmail, `from:"${sanitized}"`),
  ]);

  return { lastSent, lastReceived };
}

export interface EmailHistoryItem {
  date: string | null;
  from: string | null;
  subject: string | null;
  snippet: string;
}

/**
 * Recent messages (either direction) with this address, newest first, for use as
 * context when drafting a follow-up — subject/snippet only, not full MIME bodies.
 */
export async function getRecentThreadHistory(
  auth: OAuth2Client,
  email: string,
  maxMessages = 6,
): Promise<EmailHistoryItem[]> {
  const gmail = google.gmail({ version: "v1", auth });
  const sanitized = email.replace(/"/g, '\\"');

  const list = await gmail.users.messages.list({
    userId: "me",
    q: `from:"${sanitized}" OR to:"${sanitized}"`,
    maxResults: maxMessages,
  });
  const ids = (list.data.messages ?? []).map((m) => m.id).filter((id): id is string => Boolean(id));
  if (ids.length === 0) return [];

  const messages = await Promise.all(
    ids.map((id) =>
      gmail.users.messages.get({
        userId: "me",
        id,
        format: "metadata",
        metadataHeaders: ["From", "Subject"],
      }),
    ),
  );

  return messages.map((m) => {
    const headers = m.data.payload?.headers ?? [];
    const find = (name: string) => headers.find((h) => h.name === name)?.value ?? null;
    return {
      date: toIsoDate(m.data.internalDate),
      from: find("From"),
      subject: find("Subject"),
      snippet: m.data.snippet ?? "",
    };
  });
}

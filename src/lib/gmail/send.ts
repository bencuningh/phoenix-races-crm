import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";

function encodeRawMessage(to: string, subject: string, body: string): string {
  const message = [
    `To: ${to}`,
    `Subject: =?utf-8?B?${Buffer.from(subject, "utf-8").toString("base64")}?=`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    body,
  ].join("\r\n");

  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Sends a plain-text email to the connected Gmail account itself (the digest recipient). */
export async function sendSelfEmail(auth: OAuth2Client, subject: string, body: string): Promise<void> {
  const gmail = google.gmail({ version: "v1", auth });
  const profile = await gmail.users.getProfile({ userId: "me" });
  const selfAddress = profile.data.emailAddress;
  if (!selfAddress) throw new Error("Could not determine the connected Gmail address");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encodeRawMessage(selfAddress, subject, body) },
  });
}

import { google } from "googleapis";
import { env } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase";

export const GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

export function createOAuthClient() {
  return new google.auth.OAuth2(
    env.googleClientId,
    env.googleClientSecret,
    env.googleRedirectUri,
  );
}

export function getAuthUrl(): string {
  const client = createOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GMAIL_SCOPES,
  });
}

export async function storeRefreshToken(refreshToken: string): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase.from("oauth_tokens").upsert(
    {
      provider: "gmail",
      refresh_token: refreshToken,
      scope: GMAIL_SCOPES.join(" "),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "provider" },
  );
  if (error) throw error;
}

/**
 * Returns an OAuth2 client authorized with the stored Gmail refresh token.
 * Throws if Gmail has never been connected (no row in oauth_tokens yet).
 */
export async function getAuthorizedGmailClient() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("oauth_tokens")
    .select("refresh_token")
    .eq("provider", "gmail")
    .maybeSingle();

  if (error) throw error;
  if (!data?.refresh_token) {
    throw new Error(
      "Gmail is not connected yet. Visit /api/auth/google to authorize access.",
    );
  }

  const client = createOAuthClient();
  client.setCredentials({ refresh_token: data.refresh_token });
  return client;
}

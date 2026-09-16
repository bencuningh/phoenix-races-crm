import { NextRequest, NextResponse } from "next/server";
import { createOAuthClient, storeRefreshToken } from "@/lib/gmail/oauth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const oauthError = request.nextUrl.searchParams.get("error");

  if (oauthError) {
    return NextResponse.json({ error: oauthError }, { status: 400 });
  }
  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
  }

  const client = createOAuthClient();
  const { tokens } = await client.getToken(code);

  if (!tokens.refresh_token) {
    return NextResponse.json(
      {
        error:
          "No refresh token returned. Revoke Phoenix Races CRM access at https://myaccount.google.com/permissions and try again (Google only issues a refresh token on first consent).",
      },
      { status: 400 },
    );
  }

  await storeRefreshToken(tokens.refresh_token);

  return NextResponse.redirect(new URL("/?gmail_connected=1", request.url));
}

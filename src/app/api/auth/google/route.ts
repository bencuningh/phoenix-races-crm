import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/gmail/oauth";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.redirect(getAuthUrl());
}

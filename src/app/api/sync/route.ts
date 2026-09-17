import { NextResponse } from "next/server";
import { runSync } from "@/lib/sync";
import { getErrorMessage } from "@/lib/errors";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
  try {
    const result = await runSync("manual");
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

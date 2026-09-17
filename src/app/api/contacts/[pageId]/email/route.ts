import { NextRequest, NextResponse } from "next/server";
import { updateEmail } from "@/lib/notion";
import { createServiceClient } from "@/lib/supabase";
import { getErrorMessage } from "@/lib/errors";

export const dynamic = "force-dynamic";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> },
) {
  const { pageId } = await params;
  const body = await request.json().catch(() => null);
  const raw = body?.email;

  if (raw !== null && typeof raw !== "string") {
    return NextResponse.json({ error: "email must be a string or null" }, { status: 400 });
  }
  const email = raw ? raw.trim() : null;
  if (email && !isValidEmail(email)) {
    return NextResponse.json({ error: "Adresse email invalide" }, { status: 400 });
  }

  try {
    await updateEmail(pageId, email);

    const supabase = createServiceClient();
    const { error } = await supabase
      .from("contacts_cache")
      .update({ email, needs_qualification: !email, updated_at: new Date().toISOString() })
      .eq("notion_page_id", pageId);
    if (error) throw error;

    return NextResponse.json({ ok: true, email });
  } catch (err) {
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { updateLinkedin } from "@/lib/notion";
import { createServiceClient } from "@/lib/supabase";
import { getErrorMessage } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> },
) {
  const { pageId } = await params;
  const body = await request.json().catch(() => null);
  const raw = body?.linkedin;

  if (raw !== null && typeof raw !== "string") {
    return NextResponse.json({ error: "linkedin must be a string or null" }, { status: 400 });
  }
  const linkedin = raw ? raw.trim() : null;
  if (linkedin && !/^https?:\/\//.test(linkedin)) {
    return NextResponse.json({ error: "L'URL doit commencer par http(s)://" }, { status: 400 });
  }

  try {
    await updateLinkedin(pageId, linkedin);

    const supabase = createServiceClient();
    const { error } = await supabase
      .from("contacts_cache")
      .update({ linkedin, updated_at: new Date().toISOString() })
      .eq("notion_page_id", pageId);
    if (error) throw error;

    return NextResponse.json({ ok: true, linkedin });
  } catch (err) {
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

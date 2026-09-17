import { NextRequest, NextResponse } from "next/server";
import { updatePhone } from "@/lib/notion";
import { createServiceClient } from "@/lib/supabase";
import { getErrorMessage } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> },
) {
  const { pageId } = await params;
  const body = await request.json().catch(() => null);
  const raw = body?.phone;

  if (raw !== null && typeof raw !== "string") {
    return NextResponse.json({ error: "phone must be a string or null" }, { status: 400 });
  }
  const phone = raw ? raw.trim() : null;

  try {
    await updatePhone(pageId, phone);

    const supabase = createServiceClient();
    const { error } = await supabase
      .from("contacts_cache")
      .update({ phone, updated_at: new Date().toISOString() })
      .eq("notion_page_id", pageId);
    if (error) throw error;

    return NextResponse.json({ ok: true, phone });
  } catch (err) {
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

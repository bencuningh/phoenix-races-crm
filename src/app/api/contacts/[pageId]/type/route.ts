import { NextRequest, NextResponse } from "next/server";
import { updateType } from "@/lib/notion";
import { createServiceClient } from "@/lib/supabase";
import { TYPES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> },
) {
  const { pageId } = await params;
  const body = await request.json().catch(() => null);
  const type = body?.type;

  if (typeof type !== "string" || !TYPES.includes(type as (typeof TYPES)[number])) {
    return NextResponse.json(
      { error: `type must be one of: ${TYPES.join(", ")}` },
      { status: 400 },
    );
  }

  try {
    await updateType(pageId, type);

    const supabase = createServiceClient();
    const { error } = await supabase
      .from("contacts_cache")
      .update({ type, updated_at: new Date().toISOString() })
      .eq("notion_page_id", pageId);
    if (error) throw error;

    return NextResponse.json({ ok: true, type });
  } catch (err) {
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

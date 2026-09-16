import { NextRequest, NextResponse } from "next/server";
import { updateCategory } from "@/lib/notion";
import { createServiceClient } from "@/lib/supabase";
import { CATEGORIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> },
) {
  const { pageId } = await params;
  const body = await request.json().catch(() => null);
  const category = body?.category;

  if (typeof category !== "string" || !CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    return NextResponse.json(
      { error: `category must be one of: ${CATEGORIES.join(", ")}` },
      { status: 400 },
    );
  }

  try {
    await updateCategory(pageId, category);

    const supabase = createServiceClient();
    const { error } = await supabase
      .from("contacts_cache")
      .update({ category, updated_at: new Date().toISOString() })
      .eq("notion_page_id", pageId);
    if (error) throw error;

    return NextResponse.json({ ok: true, category });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

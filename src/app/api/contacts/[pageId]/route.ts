import { NextRequest, NextResponse } from "next/server";
import { archiveContact } from "@/lib/notion";
import { createServiceClient } from "@/lib/supabase";
import { getErrorMessage } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> },
) {
  const { pageId } = await params;

  try {
    await archiveContact(pageId);

    const supabase = createServiceClient();
    const { error } = await supabase.from("contacts_cache").delete().eq("notion_page_id", pageId);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

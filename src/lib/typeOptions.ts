import { createServiceClient } from "@/lib/supabase";

/** Reads the Type options last cached by a sync run (see `runSync` in `@/lib/sync`). */
export async function getCachedTypeOptions(): Promise<string[]> {
  const supabase = createServiceClient();
  const { data } = await supabase.from("type_options").select("options").eq("id", 1).maybeSingle();
  return data?.options ?? [];
}

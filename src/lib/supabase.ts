import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Server-only Supabase client using the service role key.
 * Never import this from a Client Component — the service key must stay server-side.
 */
export function createServiceClient() {
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });
}

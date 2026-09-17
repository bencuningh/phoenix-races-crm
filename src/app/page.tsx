import { createServiceClient } from "@/lib/supabase";
import { Dashboard } from "@/components/Dashboard";
import { SyncButton } from "@/components/SyncButton";
import { isSnoozed } from "@/lib/followup";
import type { CachedContactRow } from "@/types/contact";

export const dynamic = "force-dynamic";

function sortFollowup(a: CachedContactRow, b: CachedContactRow): number {
  const aNever = a.followup_reason === "never_contacted";
  const bNever = b.followup_reason === "never_contacted";
  if (aNever !== bNever) return aNever ? -1 : 1;
  return (b.days_since_contact ?? 0) - (a.days_since_contact ?? 0);
}

export default async function Home() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("contacts_cache")
    .select("*")
    .order("name", { ascending: true });

  const contacts: CachedContactRow[] = data ?? [];
  const followupContacts = contacts
    .filter((c) => c.needs_followup && !isSnoozed(c))
    .sort(sortFollowup);

  const types = [...new Set(contacts.map((c) => c.type).filter(Boolean))] as string[];

  return (
    <div className="flex min-h-full flex-col">
      <header className="header-motif bg-turquoise-fonce px-4 py-6 text-blanc-sable">
        <div className="mx-auto flex max-w-7xl items-start justify-between gap-4">
          <div>
            <p className="font-display text-2xl leading-none">Phoenix Races</p>
            <p className="mt-1 text-sm text-blanc-sable/75">Relances partenaires</p>
          </div>
          <SyncButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5">
        {error ? (
          <p className="rounded-xl border border-orange-braise/40 bg-orange-braise/10 p-4 text-sm text-orange-braise">
            Impossible de lire le cache Supabase ({error.message}). Lance une synchronisation
            une fois les variables d&rsquo;environnement configurées.
          </p>
        ) : contacts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border-subtle p-6 text-center text-sm text-noir-nuit/50">
            Aucune donnée en cache. Lance une synchronisation pour importer les contacts Notion.
          </p>
        ) : (
          <Dashboard
            followupContacts={followupContacts}
            allContacts={contacts}
            types={types}
          />
        )}
      </main>
    </div>
  );
}

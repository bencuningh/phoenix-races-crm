"use client";

import { useMemo, useState } from "react";
import type { CachedContactRow } from "@/types/contact";
import { ContactCard } from "@/components/ContactCard";
import { ContactsTable } from "@/components/ContactsTable";

type Tab = "relances" | "qualifier" | "toutes";
type SortKey = "name" | "last_reach_desc" | "last_reach_asc" | "days_desc";
type ViewMode = "cartes" | "tableau";

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-orange-braise bg-orange-braise text-blanc-sable"
          : "border-border-subtle text-noir-nuit/70"
      }`}
    >
      {label}
    </button>
  );
}

function sortContacts(contacts: CachedContactRow[], sort: SortKey): CachedContactRow[] {
  const sorted = [...contacts];
  switch (sort) {
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "last_reach_desc":
      return sorted.sort((a, b) => (b.last_reach ?? "").localeCompare(a.last_reach ?? ""));
    case "last_reach_asc":
      return sorted.sort((a, b) => (a.last_reach ?? "9999").localeCompare(b.last_reach ?? "9999"));
    case "days_desc":
      return sorted.sort((a, b) => (b.days_since_contact ?? -1) - (a.days_since_contact ?? -1));
  }
}

export function Dashboard({
  followupContacts,
  qualifyContacts,
  allContacts,
  types,
}: {
  followupContacts: CachedContactRow[];
  qualifyContacts: CachedContactRow[];
  allContacts: CachedContactRow[];
  types: string[];
}) {
  const [tab, setTab] = useState<Tab>("relances");
  const [type, setType] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("name");
  const [view, setView] = useState<ViewMode>("cartes");

  const source =
    tab === "relances" ? followupContacts : tab === "qualifier" ? qualifyContacts : allContacts;

  const filtered = useMemo(() => {
    return source.filter((c) => !type || c.type === type);
  }, [source, type]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("relances")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            tab === "relances"
              ? "bg-turquoise-fonce text-blanc-sable"
              : "bg-surface text-noir-nuit/70 border border-border-subtle"
          }`}
        >
          À relancer ({followupContacts.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("qualifier")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            tab === "qualifier"
              ? "bg-turquoise-fonce text-blanc-sable"
              : "bg-surface text-noir-nuit/70 border border-border-subtle"
          }`}
        >
          À qualifier ({qualifyContacts.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("toutes")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            tab === "toutes"
              ? "bg-turquoise-fonce text-blanc-sable"
              : "bg-surface text-noir-nuit/70 border border-border-subtle"
          }`}
        >
          Toutes ({allContacts.length})
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <FilterChip label="Tous types" active={type === null} onClick={() => setType(null)} />
          {types.map((t) => (
            <FilterChip key={t} label={t} active={type === t} onClick={() => setType(t)} />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <FilterChip label="Cartes" active={view === "cartes"} onClick={() => setView("cartes")} />
          <FilterChip label="Tableau" active={view === "tableau"} onClick={() => setView("tableau")} />
          {view === "tableau" && (
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-full border border-border-subtle bg-surface px-3 py-1 text-xs text-noir-nuit/70"
            >
              <option value="name">Trier par nom</option>
              <option value="last_reach_desc">Dernier contact (récent d&apos;abord)</option>
              <option value="last_reach_asc">Dernier contact (ancien d&apos;abord)</option>
              <option value="days_desc">Jours depuis contact (décroissant)</option>
            </select>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border-subtle p-6 text-center text-sm text-noir-nuit/50">
          Aucun contact ne correspond à ces filtres.
        </p>
      ) : view === "tableau" ? (
        <ContactsTable contacts={sortContacts(filtered, sort)} />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {filtered.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </ul>
      )}
    </div>
  );
}

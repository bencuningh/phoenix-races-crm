"use client";

import { useMemo, useState } from "react";
import type { CachedContactRow } from "@/types/contact";
import { ContactCard } from "@/components/ContactCard";

type Tab = "relances" | "qualifier";

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

export function Dashboard({
  followupContacts,
  qualifyContacts,
  categories,
  types,
}: {
  followupContacts: CachedContactRow[];
  qualifyContacts: CachedContactRow[];
  categories: string[];
  types: string[];
}) {
  const [tab, setTab] = useState<Tab>("relances");
  const [category, setCategory] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);

  const source = tab === "relances" ? followupContacts : qualifyContacts;

  const filtered = useMemo(() => {
    return source.filter(
      (c) => (!category || c.category === category) && (!type || c.type === type),
    );
  }, [source, category, type]);

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
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <FilterChip label="Toutes catégories" active={category === null} onClick={() => setCategory(null)} />
          {categories.map((c) => (
            <FilterChip key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
          ))}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <FilterChip label="Tous types" active={type === null} onClick={() => setType(null)} />
          {types.map((t) => (
            <FilterChip key={t} label={t} active={type === t} onClick={() => setType(t)} />
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border-subtle p-6 text-center text-sm text-noir-nuit/50">
          Aucun contact ne correspond à ces filtres.
        </p>
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

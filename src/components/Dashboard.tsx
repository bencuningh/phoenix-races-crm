"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import type { CachedContactRow } from "@/types/contact";
import { ContactCard } from "@/components/ContactCard";
import { ContactsTable } from "@/components/ContactsTable";
import {
  subscribeSavedViews,
  getSavedViewsSnapshot,
  getSavedViewsServerSnapshot,
  parseSavedViews,
  persistSavedViews,
  matchesView,
  type SavedView,
} from "@/lib/savedViews";

type SortKey = "name" | "last_reach_desc" | "last_reach_asc" | "days_desc";

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

const BUILTIN_TABS = new Set(["relances", "toutes", "tableau"]);

export function Dashboard({
  followupContacts,
  allContacts,
  types,
  typeOptions,
  defaultFollowupThreshold,
}: {
  followupContacts: CachedContactRow[];
  allContacts: CachedContactRow[];
  types: string[];
  typeOptions: string[];
  defaultFollowupThreshold: number;
}) {
  const [tab, setTab] = useState<string>("relances");
  const [type, setType] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("name");

  const [creatingView, setCreatingView] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftType, setDraftType] = useState("");
  const [draftStatus, setDraftStatus] = useState<SavedView["status"]>("all");
  const [draftMinDays, setDraftMinDays] = useState("");
  const [draftMaxDays, setDraftMaxDays] = useState("");

  const viewsRaw = useSyncExternalStore(
    subscribeSavedViews,
    getSavedViewsSnapshot,
    getSavedViewsServerSnapshot,
  );
  const views = useMemo(() => parseSavedViews(viewsRaw), [viewsRaw]);

  const activeView = views.find((v) => v.id === tab);

  const source: CachedContactRow[] = BUILTIN_TABS.has(tab)
    ? tab === "relances"
      ? followupContacts
      : allContacts
    : activeView
      ? allContacts.filter((c) => matchesView(c, activeView))
      : allContacts;

  const filtered = useMemo(() => {
    return source.filter((c) => !type || c.type === type);
  }, [source, type]);

  function resetDraft() {
    setDraftName("");
    setDraftType("");
    setDraftStatus("all");
    setDraftMinDays("");
    setDraftMaxDays("");
  }

  function saveNewView() {
    const name = draftName.trim();
    if (!name) return;
    const view: SavedView = {
      id: crypto.randomUUID(),
      name,
      type: draftType || null,
      status: draftStatus,
      minDays: draftMinDays.trim() ? Number.parseInt(draftMinDays, 10) : null,
      maxDays: draftMaxDays.trim() ? Number.parseInt(draftMaxDays, 10) : null,
    };
    persistSavedViews([...views, view]);
    setTab(view.id);
    setCreatingView(false);
    resetDraft();
  }

  function deleteView(id: string) {
    persistSavedViews(views.filter((v) => v.id !== id));
    if (tab === id) setTab("relances");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setTab("relances")}
          className={`rounded-lg py-2 text-sm font-medium transition-colors ${
            tab === "relances"
              ? "bg-turquoise-fonce text-blanc-sable"
              : "bg-surface text-noir-nuit/70 border border-border-subtle"
          }`}
        >
          À relancer ({followupContacts.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("toutes")}
          className={`rounded-lg py-2 text-sm font-medium transition-colors ${
            tab === "toutes"
              ? "bg-turquoise-fonce text-blanc-sable"
              : "bg-surface text-noir-nuit/70 border border-border-subtle"
          }`}
        >
          Toutes ({allContacts.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("tableau")}
          className={`rounded-lg py-2 text-sm font-medium transition-colors ${
            tab === "tableau"
              ? "bg-turquoise-fonce text-blanc-sable"
              : "bg-surface text-noir-nuit/70 border border-border-subtle"
          }`}
        >
          Tableau
        </button>
      </div>

      {views.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {views.map((v) => (
            <div key={v.id} className="flex shrink-0 items-center gap-1">
              <FilterChip label={v.name} active={tab === v.id} onClick={() => setTab(v.id)} />
              {tab === v.id && (
                <button
                  type="button"
                  onClick={() => deleteView(v.id)}
                  aria-label={`Supprimer la vue ${v.name}`}
                  className="text-xs text-orange-braise"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <FilterChip label="Tous types" active={type === null} onClick={() => setType(null)} />
          {types.map((t) => (
            <FilterChip key={t} label={t} active={type === t} onClick={() => setType(t)} />
          ))}
          <button
            type="button"
            onClick={() => setCreatingView((v) => !v)}
            className="shrink-0 rounded-full border border-dashed border-border-subtle px-3 py-1 text-xs font-medium text-noir-nuit/70"
          >
            + Nouvelle vue
          </button>
        </div>
        {tab === "tableau" && (
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="w-fit rounded-full border border-border-subtle bg-surface px-3 py-1 text-xs text-noir-nuit/70"
          >
            <option value="name">Trier par nom</option>
            <option value="last_reach_desc">Dernier contact (récent d&apos;abord)</option>
            <option value="last_reach_asc">Dernier contact (ancien d&apos;abord)</option>
            <option value="days_desc">Jours depuis contact (décroissant)</option>
          </select>
        )}
      </div>

      {creatingView && (
        <div className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-surface p-3">
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="Nom de la vue"
              autoFocus
              className="min-w-0 flex-1 rounded border border-border-subtle bg-blanc-sable px-2 py-1 text-xs"
            />
            <select
              value={draftType}
              onChange={(e) => setDraftType(e.target.value)}
              className="rounded border border-border-subtle bg-blanc-sable px-2 py-1 text-xs"
            >
              <option value="">Tous types</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={draftStatus}
              onChange={(e) => setDraftStatus(e.target.value as SavedView["status"])}
              className="rounded border border-border-subtle bg-blanc-sable px-2 py-1 text-xs"
            >
              <option value="all">Tous statuts</option>
              <option value="relancer">À relancer</option>
              <option value="ok">OK</option>
            </select>
            <input
              type="number"
              min={0}
              value={draftMinDays}
              onChange={(e) => setDraftMinDays(e.target.value)}
              placeholder="Jours min"
              className="w-24 rounded border border-border-subtle bg-blanc-sable px-2 py-1 text-xs"
            />
            <input
              type="number"
              min={0}
              value={draftMaxDays}
              onChange={(e) => setDraftMaxDays(e.target.value)}
              placeholder="Jours max"
              className="w-24 rounded border border-border-subtle bg-blanc-sable px-2 py-1 text-xs"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setCreatingView(false);
                resetDraft();
              }}
              className="text-xs text-noir-nuit/60"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={saveNewView}
              disabled={!draftName.trim()}
              className="rounded bg-orange-braise px-3 py-1 text-xs text-blanc-sable disabled:opacity-60"
            >
              Enregistrer la vue
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border-subtle p-6 text-center text-sm text-noir-nuit/50">
          Aucun contact ne correspond à ces filtres.
        </p>
      ) : tab === "tableau" ? (
        <ContactsTable
          contacts={sortContacts(filtered, sort)}
          defaultFollowupThreshold={defaultFollowupThreshold}
          typeOptions={typeOptions}
        />
      ) : (
        <ul className="mx-auto flex w-full max-w-2xl flex-col gap-2.5">
          {filtered.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              defaultFollowupThreshold={defaultFollowupThreshold}
              typeOptions={typeOptions}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

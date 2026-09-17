import type { CachedContactRow } from "@/types/contact";

export interface SavedView {
  id: string;
  name: string;
  type: string | null;
  status: "all" | "relancer" | "ok";
  minDays: number | null;
  maxDays: number | null;
}

const STORAGE_KEY = "phoenix-crm-saved-views";

/** Saved views live in this browser's localStorage — no backend table for them. */

type Listener = () => void;
let listeners: Listener[] = [];

function emitChange(): void {
  for (const listener of listeners) listener();
}

export function subscribeSavedViews(callback: Listener): () => void {
  listeners = [...listeners, callback];
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

export function getSavedViewsSnapshot(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

export function getSavedViewsServerSnapshot(): string {
  return "[]";
}

export function parseSavedViews(raw: string): SavedView[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistSavedViews(views: SavedView[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
  } catch {
    // Private browsing, storage quota, etc. — the view just won't persist.
  }
  emitChange();
}

export function matchesView(contact: CachedContactRow, view: SavedView): boolean {
  if (view.type && contact.type !== view.type) return false;
  if (view.status === "relancer" && !contact.needs_followup) return false;
  if (view.status === "ok" && contact.needs_followup) return false;
  const days = contact.days_since_contact;
  if (view.minDays !== null && (days ?? -1) < view.minDays) return false;
  if (view.maxDays !== null && (days === null || days > view.maxDays)) return false;
  return true;
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function FollowupThresholdControl({
  pageId,
  value,
  defaultDays,
  compact = false,
}: {
  pageId: string;
  value: number | null;
  defaultDays: number;
  compact?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState(value !== null ? String(value) : "");

  async function save(next: number | null) {
    setDraft(next !== null ? String(next) : "");
    await fetch(`/api/contacts/${pageId}/followup-threshold`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followup_threshold_days: next }),
    });
    startTransition(() => router.refresh());
  }

  function handleBlur() {
    const trimmed = draft.trim();
    if (trimmed === "") {
      if (value !== null) save(null);
      return;
    }
    const parsed = Number.parseInt(trimmed, 10);
    if (Number.isInteger(parsed) && parsed > 0) {
      if (parsed !== value) save(parsed);
    } else {
      setDraft(value !== null ? String(value) : "");
    }
  }

  return (
    <div className="flex items-center gap-1 text-[11px] text-noir-nuit/60">
      {!compact && <span>Relancer après</span>}
      <input
        type="number"
        min={1}
        value={draft}
        placeholder={String(defaultDays)}
        disabled={isPending}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
        className="w-12 rounded border border-border-subtle bg-surface px-1 py-0.5 text-[11px] disabled:opacity-60"
      />
      <span>j{!compact && ` (défaut ${defaultDays})`}</span>
    </div>
  );
}

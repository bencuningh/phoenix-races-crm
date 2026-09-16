"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function SnoozeControl({
  pageId,
  value,
  hideLabel = false,
}: {
  pageId: string;
  value: string | null;
  hideLabel?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [date, setDate] = useState(value ?? "");

  async function save(next: string | null) {
    setDate(next ?? "");
    await fetch(`/api/contacts/${pageId}/snooze`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ snooze_until: next }),
    });
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex items-center gap-1.5 text-[11px] text-noir-nuit/60">
      {!hideLabel && <span>Relancer le</span>}
      <input
        type="date"
        value={date}
        disabled={isPending}
        onChange={(e) => save(e.target.value || null)}
        className="rounded border border-border-subtle bg-surface px-1 py-0.5 text-[11px] disabled:opacity-60"
      />
      {date && (
        <button
          type="button"
          onClick={() => save(null)}
          disabled={isPending}
          className="text-orange-braise disabled:opacity-60"
        >
          Effacer
        </button>
      )}
    </div>
  );
}

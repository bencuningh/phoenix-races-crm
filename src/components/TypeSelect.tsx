"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TYPES } from "@/lib/constants";

export function TypeSelect({
  pageId,
  value,
}: {
  pageId: string;
  value: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [current, setCurrent] = useState(value ?? "");
  const [error, setError] = useState<string | null>(null);

  async function handleChange(next: string) {
    const previous = current;
    setCurrent(next);
    setError(null);
    try {
      const res = await fetch(`/api/contacts/${pageId}/type`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "échec de la mise à jour");
      }
      startTransition(() => router.refresh());
    } catch (err) {
      setCurrent(previous);
      setError(err instanceof Error ? err.message : "erreur");
    }
  }

  return (
    <div className="inline-flex flex-col">
      <select
        value={current}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-full border border-border-subtle bg-surface px-2 py-0.5 text-xs text-noir-nuit/70 disabled:opacity-60"
      >
        <option value="" disabled>
          Type
        </option>
        {TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      {error && <span className="mt-1 text-[10px] text-orange-braise">{error}</span>}
    </div>
  );
}

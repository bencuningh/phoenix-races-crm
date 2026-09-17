"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function DeleteContactButton({
  pageId,
  name,
  compact = false,
}: {
  pageId: string;
  name: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm(`Supprimer ${name} ? Cette action archive le contact dans Notion.`)) {
      return;
    }
    setError(null);
    const res = await fetch(`/api/contacts/${pageId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "échec de la suppression");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className={compact ? "" : "mt-2"}>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="rounded-full border border-orange-braise/40 px-2 py-0.5 text-[11px] text-orange-braise disabled:opacity-60"
      >
        {isPending ? "…" : "Supprimer"}
      </button>
      {error && <p className="mt-1 text-xs text-orange-braise">{error}</p>}
    </div>
  );
}

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function StandbyToggle({
  pageId,
  standby,
  compact = false,
}: {
  pageId: string;
  standby: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function toggle() {
    await fetch(`/api/contacts/${pageId}/standby`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ standby: !standby }),
    });
    startTransition(() => router.refresh());
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      className="rounded-full border border-border-subtle px-2 py-0.5 text-[11px] text-noir-nuit/60 disabled:opacity-60"
    >
      {standby ? "Reprendre" : compact ? "Stand-by" : "Mettre en stand-by"}
    </button>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function SyncButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  async function handleSync() {
    setStatus(null);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setStatus(`Erreur : ${data.error ?? "échec de la synchronisation"}`);
        return;
      }
      setStatus(
        `${data.contactsProcessed} contact(s) traités, ${data.contactsUpdated} mis à jour.`,
      );
      startTransition(() => router.refresh());
    } catch {
      setStatus("Erreur réseau pendant la synchronisation.");
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        type="button"
        onClick={handleSync}
        disabled={isPending}
        className="rounded-full bg-orange-braise px-4 py-2 text-sm font-medium text-blanc-sable shadow-sm transition-opacity disabled:opacity-60"
      >
        {isPending ? "Synchronisation…" : "Sync maintenant"}
      </button>
      {status && <p className="max-w-[220px] text-right text-xs text-blanc-sable/80">{status}</p>}
    </div>
  );
}

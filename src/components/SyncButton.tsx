"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

function formatTime(date: Date): string {
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function SyncButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSyncing, setIsSyncing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleSync() {
    setIsSyncing(true);
    setStatus(null);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setStatus(`Erreur : ${data.error ?? "échec de la synchronisation"}`);
        return;
      }
      setStatus(
        `Terminé à ${formatTime(new Date())} — ${data.contactsProcessed} contact(s) traités, ${data.contactsUpdated} mis à jour.`,
      );
      startTransition(() => router.refresh());
    } catch {
      setStatus("Erreur réseau pendant la synchronisation.");
    } finally {
      setIsSyncing(false);
    }
  }

  const busy = isSyncing || isPending;

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        type="button"
        onClick={handleSync}
        disabled={busy}
        className="rounded-full bg-orange-braise px-4 py-2 text-sm font-medium text-blanc-sable shadow-sm transition-opacity disabled:opacity-60"
      >
        {busy ? "Synchronisation…" : "Sync maintenant"}
      </button>
      {status && <p className="max-w-[220px] text-right text-xs text-blanc-sable/80">{status}</p>}
    </div>
  );
}

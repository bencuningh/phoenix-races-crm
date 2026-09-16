"use client";

import { useState } from "react";

export function DraftButton({ pageId }: { pageId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch(`/api/contacts/${pageId}/draft`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "échec de la génération");
      setDraft(data);
      setStatus("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "erreur");
      setStatus("error");
    }
  }

  async function handleCopy() {
    if (!draft) return;
    await navigator.clipboard.writeText(`${draft.subject}\n\n${draft.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-3 border-t border-border-subtle pt-3">
      {!draft && (
        <button
          type="button"
          onClick={handleGenerate}
          disabled={status === "loading"}
          className="rounded-full border border-turquoise-fonce px-3 py-1 text-xs font-medium text-turquoise-fonce disabled:opacity-60"
        >
          {status === "loading" ? "Génération…" : "Générer un brouillon"}
        </button>
      )}
      {status === "error" && <p className="mt-1 text-xs text-orange-braise">{error}</p>}
      {draft && (
        <div className="flex flex-col gap-2 text-sm">
          <p className="font-medium text-noir-nuit">{draft.subject}</p>
          <p className="whitespace-pre-wrap text-noir-nuit/80">{draft.body}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-full bg-orange-braise px-3 py-1 text-xs font-medium text-blanc-sable"
            >
              {copied ? "Copié !" : "Copier"}
            </button>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="rounded-full border border-border-subtle px-3 py-1 text-xs text-noir-nuit/60"
            >
              Regénérer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

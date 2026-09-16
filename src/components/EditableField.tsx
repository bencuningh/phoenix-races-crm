"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function EditableField({
  pageId,
  field,
  value,
  placeholder,
  type = "text",
}: {
  pageId: string;
  field: "email" | "linkedin" | "phone";
  value: string | null;
  placeholder: string;
  type?: "text" | "email" | "url" | "tel";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState(value ?? "");
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  async function save() {
    const trimmed = draft.trim();
    if (trimmed === (value ?? "")) {
      setEditing(false);
      return;
    }
    setError(null);
    try {
      const res = await fetch(`/api/contacts/${pageId}/${field}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: trimmed || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "échec de la mise à jour");
      setEditing(false);
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "erreur");
    }
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-left text-xs text-noir-nuit/60 underline decoration-dotted underline-offset-2"
      >
        {value || placeholder}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1.5">
        <input
          type={type}
          value={draft}
          autoFocus
          disabled={isPending}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded border border-border-subtle bg-surface px-1.5 py-0.5 text-xs disabled:opacity-60"
        />
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="rounded bg-orange-braise px-2 py-0.5 text-xs text-blanc-sable disabled:opacity-60"
        >
          OK
        </button>
      </div>
      {error && <span className="text-[10px] text-orange-braise">{error}</span>}
    </div>
  );
}

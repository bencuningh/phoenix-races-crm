import type { CachedContactRow } from "@/types/contact";
import { TypeSelect } from "@/components/TypeSelect";
import { StandbyToggle } from "@/components/StandbyToggle";
import { SnoozeControl } from "@/components/SnoozeControl";
import { EditableField } from "@/components/EditableField";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  });
}

const th = "sticky top-0 bg-turquoise-fonce px-3 py-2 text-left text-xs font-medium text-blanc-sable whitespace-nowrap";
const td = "px-3 py-2 align-top text-xs text-noir-nuit border-b border-border-subtle whitespace-nowrap";

export function ContactsTable({ contacts }: { contacts: CachedContactRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border-subtle">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={th}>Nom</th>
            <th className={th}>Entreprise</th>
            <th className={th}>Type</th>
            <th className={th}>Email</th>
            <th className={th}>Téléphone</th>
            <th className={th}>LinkedIn</th>
            <th className={th}>Dernier contact</th>
            <th className={th}>Jours</th>
            <th className={th}>Statut</th>
            <th className={th}>Stand-by</th>
            <th className={th}>Relancer le</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((c) => (
            <tr key={c.id} className="bg-surface even:bg-blanc-sable/40">
              <td className={`${td} font-semibold`}>{c.name}</td>
              <td className={td}>{c.company && c.company !== c.name ? c.company : "—"}</td>
              <td className={td}>
                <TypeSelect pageId={c.notion_page_id} value={c.type} />
              </td>
              <td className={td}>
                <EditableField pageId={c.notion_page_id} field="email" type="email" value={c.email} placeholder="+ email" />
              </td>
              <td className={td}>
                <EditableField pageId={c.notion_page_id} field="phone" type="tel" value={c.phone} placeholder="+ tél." />
              </td>
              <td className={td}>
                <EditableField pageId={c.notion_page_id} field="linkedin" type="url" value={c.linkedin} placeholder="+ LinkedIn" />
              </td>
              <td className={td}>{formatDate(c.last_reach)}</td>
              <td className={`${td} ${c.days_since_contact !== null ? "font-medium text-orange-braise" : ""}`}>
                {c.days_since_contact ?? "—"}
              </td>
              <td className={td}>
                {c.needs_qualification ? "À qualifier" : c.needs_followup ? "À relancer" : "OK"}
              </td>
              <td className={td}>
                <StandbyToggle pageId={c.notion_page_id} standby={c.standby} />
              </td>
              <td className={td}>
                <SnoozeControl pageId={c.notion_page_id} value={c.snooze_until} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

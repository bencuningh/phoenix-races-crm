import type { CachedContactRow } from "@/types/contact";
import { CompassIcon, HeadlampIcon, TentIcon } from "@/components/icons";
import { TypeSelect } from "@/components/TypeSelect";
import { DraftButton } from "@/components/DraftButton";
import { StandbyToggle } from "@/components/StandbyToggle";
import { SnoozeControl } from "@/components/SnoozeControl";
import { EditableField } from "@/components/EditableField";
import { DeleteContactButton } from "@/components/DeleteContactButton";
import { FollowupThresholdControl } from "@/components/FollowupThresholdControl";

const REASON_LABEL: Record<string, string> = {
  never_contacted: "Jamais contacté",
  awaiting_reply: "Sans réponse",
  silence: "Silence",
};

function ReasonBadge({ contact }: { contact: CachedContactRow }) {
  if (contact.followup_reason === "never_contacted") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-braise/15 px-2.5 py-1 text-xs font-medium text-orange-braise">
        <HeadlampIcon className="h-3.5 w-3.5" />
        {REASON_LABEL.never_contacted}
      </span>
    );
  }
  if (contact.followup_reason === "awaiting_reply") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-turquoise-fonce/10 px-2.5 py-1 text-xs font-medium text-turquoise-fonce">
        <CompassIcon className="h-3.5 w-3.5" />
        {REASON_LABEL.awaiting_reply}
      </span>
    );
  }
  if (contact.followup_reason === "silence") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-noir-nuit/8 px-2.5 py-1 text-xs font-medium text-noir-nuit/70">
        <TentIcon className="h-3.5 w-3.5" />
        {REASON_LABEL.silence}
      </span>
    );
  }
  return null;
}

function formatDate(iso: string | null): string {
  if (!iso) return "Jamais";
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function ContactCard({
  contact,
  defaultFollowupThreshold,
}: {
  contact: CachedContactRow;
  defaultFollowupThreshold: number;
}) {
  return (
    <li className="rounded-xl border border-border-subtle bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-noir-nuit">{contact.name}</p>
          {contact.company && contact.company !== contact.name && (
            <p className="truncate text-sm text-noir-nuit/60">{contact.company}</p>
          )}
        </div>
        <ReasonBadge contact={contact} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
        <TypeSelect pageId={contact.notion_page_id} value={contact.type} />
        {contact.is_company_row && (
          <span className="rounded-full border border-border-subtle px-2 py-0.5 text-noir-nuit/50">
            Entreprise
          </span>
        )}
        <StandbyToggle pageId={contact.notion_page_id} standby={contact.standby} />
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-noir-nuit/70">
        <span>Dernier contact&nbsp;: {formatDate(contact.last_reach)}</span>
        {contact.days_since_contact !== null && (
          <span className="font-medium text-orange-braise">
            {contact.days_since_contact}&nbsp;j
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <SnoozeControl pageId={contact.notion_page_id} value={contact.snooze_until} />
        <FollowupThresholdControl
          pageId={contact.notion_page_id}
          value={contact.followup_threshold_days}
          defaultDays={defaultFollowupThreshold}
        />
      </div>

      <div className="mt-2 flex flex-col gap-1">
        <EditableField
          pageId={contact.notion_page_id}
          field="email"
          type="email"
          value={contact.email}
          placeholder="+ ajouter un email"
        />
        <EditableField
          pageId={contact.notion_page_id}
          field="linkedin"
          type="url"
          value={contact.linkedin}
          placeholder="+ ajouter un LinkedIn"
        />
        <EditableField
          pageId={contact.notion_page_id}
          field="phone"
          type="tel"
          value={contact.phone}
          placeholder="+ ajouter un téléphone"
        />
      </div>

      {contact.needs_followup && <DraftButton pageId={contact.notion_page_id} />}

      <div className="mt-3 flex justify-end border-t border-border-subtle pt-2">
        <DeleteContactButton pageId={contact.notion_page_id} name={contact.name} />
      </div>
    </li>
  );
}

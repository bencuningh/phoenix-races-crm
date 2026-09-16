import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/env";
import type { CachedContactRow } from "@/types/contact";
import type { EmailHistoryItem } from "@/lib/gmail/search";

export interface EmailDraft {
  subject: string;
  body: string;
}

function getClient() {
  return new Anthropic({ apiKey: env.anthropicApiKey });
}

function formatHistory(history: EmailHistoryItem[]): string {
  if (history.length === 0) {
    return "Aucun échange email trouvé avec ce contact — c'est un premier contact ou les échanges précédents n'ont pas pu être retrouvés.";
  }
  return history
    .slice()
    .reverse()
    .map(
      (h) =>
        `[${h.date ?? "date inconnue"}] De: ${h.from ?? "?"} — Objet: ${h.subject ?? "(sans objet)"}\n${h.snippet}`,
    )
    .join("\n\n");
}

export async function generateFollowupDraft(
  contact: CachedContactRow,
  history: EmailHistoryItem[],
  styleNotes?: string,
): Promise<EmailDraft> {
  const client = getClient();

  const prompt = `Tu rédiges un email de relance pour Phoenix Races, une association qui organise une course ultra backyard (2ème édition, Épieds, Eure, Pentecôte 2027, objectif 150 coureurs). Je démarche des marques et prestataires pour des partenariats en nature (pas de sponsoring cash).

Contact à relancer :
- Nom : ${contact.name}
- Entreprise : ${contact.company ?? "N/A"}
- Type : ${contact.type ?? "N/A"}
- Catégorie : ${contact.category ?? "N/A"}
- Dernier contact : ${contact.last_reach ?? "jamais"} (${contact.days_since_contact ?? "?"} jours depuis)
- Raison de la relance : ${contact.followup_reason ?? "N/A"}

Historique des échanges email avec ce contact (du plus ancien au plus récent) :
${formatHistory(history)}
${styleNotes ? `\nConsignes de style supplémentaires :\n${styleNotes}\n` : ""}
Rédige un email de relance court, chaleureux et professionnel en français, dans le ton de mes échanges précédents si disponibles. Ne réinvente pas la conversation : appuie-toi sur ce qui a déjà été dit et évite les formules de prospection à froid génériques si un historique existe. Si aucun échange n'existe, rédige un email de première prise de contact.

Réponds UNIQUEMENT avec un objet JSON de la forme {"subject": "...", "body": "..."}, sans aucun texte avant ou après.`;

  const response = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const raw = textBlock && "text" in textBlock ? textBlock.text : "{}";

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    return { subject: String(parsed.subject ?? ""), body: String(parsed.body ?? "") };
  } catch {
    return { subject: `Relance — ${contact.name}`, body: raw };
  }
}

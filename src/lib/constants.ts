// Combined role · sector classification (merges the former Type and Category
// properties into the single Notion "Type" select).
export const TYPES = [
  "Partner · Nutrition",
  "Partner · Équipementier",
  "Partner · Application",
  "Partner · Autre",
  "Volunteer · Autre",
  "Supplier · Logistique",
  "Public · Autre",
  "Public",
  "Event Organizer",
  "Event Organizer · Event Organiser",
  "Sponsor",
] as const;
export type ContactType = (typeof TYPES)[number];

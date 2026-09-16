export const CATEGORIES = ["Nutrition", "Fringues", "Logistique", "Autre"] as const;
export type Category = (typeof CATEGORIES)[number];

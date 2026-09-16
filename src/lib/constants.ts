export const CATEGORIES = ["Nutrition", "Équipementier", "Logistique", "Autre"] as const;
export type Category = (typeof CATEGORIES)[number];

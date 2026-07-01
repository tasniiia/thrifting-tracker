import { Category } from "./types";

/* ------------------------------------------------------------------ */
/*  Environmental impact factors — rough public-average estimates for */
/*  producing ONE new garment in that category. These exist to show   */
/*  scale, not to serve as an audited figure. Swap in better sourced  */
/*  numbers here if you have them; everything downstream reads from   */
/*  this single table.                                                */
/* ------------------------------------------------------------------ */
export const IMPACT_FACTORS: Record<
  Category,
  { waterGal: number; co2Lbs: number; wasteLbs: number; color: string }
> = {
  Tops: { waterGal: 715, co2Lbs: 8, wasteLbs: 0.9, color: "#6E7F5C" },
  Bottoms: { waterGal: 1800, co2Lbs: 20, wasteLbs: 1.3, color: "#4F5B3E" },
  Dresses: { waterGal: 1000, co2Lbs: 15, wasteLbs: 1.1, color: "#B5714B" },
  Outerwear: { waterGal: 2100, co2Lbs: 35, wasteLbs: 2.5, color: "#7A5A44" },
  Shoes: { waterGal: 1600, co2Lbs: 30, wasteLbs: 2.0, color: "#8C7A5B" },
  Accessories: { waterGal: 300, co2Lbs: 5, wasteLbs: 0.4, color: "#A9A290" },
  "Home Goods": { waterGal: 500, co2Lbs: 10, wasteLbs: 1.5, color: "#5C6E63" },
  Other: { waterGal: 700, co2Lbs: 12, wasteLbs: 1.0, color: "#918F86" },
};

export const CATEGORIES = Object.keys(IMPACT_FACTORS) as Category[];

export const GALLONS_PER_BATHTUB = 80;
export const LBS_CO2_PER_MILE = 0.89;

export const STORAGE_KEYS = {
  ITEMS: "thrift-tracker:items:v2",
  BOLO: "thrift-tracker:bolo:v2",
};

/** Copy shown inside the info-tooltips on the analytics dashboard. */
export const METHODOLOGY: Record<"water" | "co2" | "waste", { title: string; body: string }> = {
  water: {
    title: "How we estimate water saved",
    body:
      "Each category carries an average water footprint for producing one new garment of that type — cotton tops, denim, leather shoes, and so on all use very different amounts. We sum that figure across every item you've thrifted instead of bought new, then convert gallons into an average 80-gallon bathtub so the number is easier to picture. This is a public-average estimate, not a per-item lab measurement.",
  },
  co2: {
    title: "How we estimate CO₂ avoided",
    body:
      "We use published average emissions for manufacturing one new item per category (material sourcing, production, and shipping). Buying secondhand instead of new avoids that footprint. We also translate the total into an equivalent number of driving miles, using roughly 0.89 lbs of CO₂ per mile for an average passenger car, so the scale is easier to feel.",
  },
  waste: {
    title: "How we estimate waste diverted",
    body:
      "Each category has an average garment weight. When you buy that item secondhand, it's a garment that stays in use instead of heading to a landfill — and it means one fewer new item needs to be produced and eventually discarded. We total the weight of everything in your ledger to estimate pounds of textile waste diverted.",
  },
};

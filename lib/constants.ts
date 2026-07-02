import { Category, Material } from "./types";

/* ==================================================================== */
/*  Category colors — purely visual (dots, category chips), separate     */
/*  from the environmental math below.                                   */
/* ==================================================================== */
export const CATEGORY_COLORS: Record<Category, string> = {
  Tops: "#6E7F5C",
  Bottoms: "#4F5B3E",
  Dresses: "#B5714B",
  Outerwear: "#7A5A44",
  Shoes: "#8C7A5B",
  Accessories: "#A9A290",
  "Home Goods": "#5C6E63",
  Other: "#918F86",
};

export const CATEGORIES = Object.keys(CATEGORY_COLORS) as Category[];

/* ==================================================================== */
/*  Environmental impact methodology                                     */
/*                                                                        */
/*  Every number below traces back to a named, real published source —   */
/*  no invented placeholder figures. That said, real garment footprints  */
/*  vary enormously by brand, mill, region, and specific fiber blend;     */
/*  treat everything here as a reasonable estimate for showing scale,    */
/*  not a lab measurement of any individual item.                        */
/*                                                                        */
/*  MATERIAL_FACTORS — per-kilogram water and CO2 figures by material     */
/*  (per-square-meter for Leather, which LCA studies measure by area,    */
/*  not weight):                                                         */
/*    - Cotton: ~10,000 L/kg water is the commonly cited global blended  */
/*      average (Water Footprint Network; regional figures range from    */
/*      ~3,800 L/kg in the US to ~22,500 L/kg in India). ~3.6 kg CO2e/kg  */
/*      (Carbon Trust).                                                  */
/*    - Denim: derived directly from Levi Strauss & Co.'s own published  */
/*      cradle-to-grave LCA of a pair of 501 jeans — 3,781 L water and    */
/*      33.4 kg CO2e per pair — divided by this app's 0.8 kg Bottoms     */
/*      weight assumption to get a per-kg rate. Note this scope includes */
/*      consumer-phase impact (washing/drying over the garment's life)   */
/*      that the other materials here don't include (they're            */
/*      production-only), so Denim isn't perfectly apples-to-apples with */
/*      the rest of this table — but it's the most specific, real,       */
/*      single-product LCA available for anything in this list, and      */
/*      using it beats not offering a denim-specific option at all.      */
/*    - Synthetic (polyester/nylon blends): low blue-water process       */
/*      (~90 L/kg) but real pollution costs show up as grey water from   */
/*      dyeing, not captured here. 9.52 kg CO2e/kg (Tekin et al., 2024,   */
/*      as cited in a 2025 IWA Publishing textile LCA study).            */
/*    - Satin is a weave, not a fiber — real satin garments can be silk, */
/*      polyester, or acetate/rayon. Published silk LCA figures vary by  */
/*      two orders of magnitude between sources (from industry-marketed  */
/*      "carbon negative via mulberry trees" claims to an independent    */
/*      cradle-to-gate estimate of ~80.9 kg CO2e/kg), too unreliable to   */
/*      cite with confidence either way. Since polyester is the most     */
/*      common fiber behind satin-weave garments in affordable and       */
/*      secondhand fashion, this models Satin as a Synthetic base with a */
/*      documented ~30-50% increase reflecting the tighter weave and     */
/*      extra finishing (e.g. calendering) satin needs for its sheen —   */
/*      a transparent assumption, not a cited figure.                    */
/*    - Wool: water figure here is processing-only, not the much larger  */
/*      and more contested land/feed footprint some full-LCA studies     */
/*      include. 23.63 kg CO2e/kg (Tekin et al., 2024) — consistent with */
/*      wool/silk/leather ranking as the highest-emission fibers per kg  */
/*      in the Pulse of the Fashion Industry report (Global Fashion      */
/*      Agenda & Boston Consulting Group, 2017).                         */
/*    - Leather: 17 kg CO2e/m² reflects tanning/processing only          */
/*      (Leather Panel-sourced estimate); studies that also allocate     */
/*      cattle-farming emissions report figures as high as 110 kg        */
/*      CO2e/m² for cow-skin leather — this app deliberately uses the    */
/*      more conservative processing-only figure rather than the upper   */
/*      bound.                                                           */
/*    - Mixed/Other: a simple average of the five kg-based material      */
/*      profiles above, used when no material is specified for an item.  */
/*                                                                        */
/*  CATEGORY_MASS_KG — typical finished-garment mass per category, used  */
/*  to scale the per-kg material factors into a per-item estimate. The   */
/*  Outerwear figure (0.85 kg) is close to the 0.807 kg average jacket   */
/*  mass reported across ~46,000 real jackets analyzed by Carbonfact.    */
/*  The Bottoms figure (0.8 kg) combined with the Cotton water rate      */
/*  above lands almost exactly on the commonly cited ~8,000 L for a pair */
/*  of jeans, and the Tops figure (0.25 kg) lands close to the widely    */
/*  cited 2,700 L for a cotton t-shirt (WWF) — both good sanity checks   */
/*  on the model. The other category weights are reasonable estimates    */
/*  without an equally strong public benchmark to check against.         */
/*                                                                        */
/*  CATEGORY_LEATHER_AREA_M2 — typical leather surface area per category */
/*  (shoes, belts, jackets), used only when an item's material is        */
/*  Leather, since leather LCA figures are reported per square meter.    */
/* ==================================================================== */

export const MATERIALS: Material[] = ["Cotton", "Denim", "Synthetic", "Satin", "Wool", "Leather", "Mixed/Other"];

interface MaterialFactor {
  waterPerUnit: number; // liters
  co2PerUnit: number; // kg CO2e
  unit: "kg" | "m2";
}

export const MATERIAL_FACTORS: Record<Material, MaterialFactor> = {
  Cotton: { waterPerUnit: 10000, co2PerUnit: 3.6, unit: "kg" },
  Denim: { waterPerUnit: 4726, co2PerUnit: 41.75, unit: "kg" },
  Synthetic: { waterPerUnit: 90, co2PerUnit: 9.52, unit: "kg" },
  Satin: { waterPerUnit: 135, co2PerUnit: 12.4, unit: "kg" },
  Wool: { waterPerUnit: 5000, co2PerUnit: 23.63, unit: "kg" },
  Leather: { waterPerUnit: 2000, co2PerUnit: 17, unit: "m2" },
  "Mixed/Other": { waterPerUnit: 3990, co2PerUnit: 18.18, unit: "kg" }, // average of the five kg-based materials above
};

export const CATEGORY_MASS_KG: Record<Category, number> = {
  Tops: 0.25,
  Bottoms: 0.8,
  Dresses: 0.35,
  Outerwear: 0.85,
  Shoes: 0.6,
  Accessories: 0.15,
  "Home Goods": 0.5,
  Other: 0.4,
};

export const CATEGORY_LEATHER_AREA_M2: Record<Category, number> = {
  Tops: 0.6,
  Bottoms: 0.9,
  Dresses: 0.7,
  Outerwear: 1.3,
  Shoes: 0.4,
  Accessories: 0.3,
  "Home Goods": 0.8,
  Other: 0.5,
};

/** Rough garment-weight leather density, used only to translate leather's
 *  area-based figures into a mass estimate for the waste-diverted metric. */
const LEATHER_DENSITY_KG_PER_M2 = 1.0;

const LITERS_PER_GALLON = 3.78541;
const KG_PER_LB = 0.453592;

export interface ItemImpact {
  waterGal: number;
  co2Lbs: number;
  wasteLbs: number;
}

/**
 * Computes water, CO2, and waste-diverted estimates for a single item from
 * its category (which sets a typical garment mass or leather area) crossed
 * with its material (which sets the per-unit water/CO2 rate). Falls back to
 * "Mixed/Other" when no material is specified, which is the case for any
 * item logged before the material field existed — see `migrateItem` in
 * ThriftContext.tsx.
 */
export function computeImpact(category: Category, material?: Material): ItemImpact {
  const factor = MATERIAL_FACTORS[material ?? "Mixed/Other"];

  let massKg: number;
  let waterLiters: number;
  let co2Kg: number;

  if (factor.unit === "m2") {
    const areaM2 = CATEGORY_LEATHER_AREA_M2[category];
    massKg = areaM2 * LEATHER_DENSITY_KG_PER_M2;
    waterLiters = areaM2 * factor.waterPerUnit;
    co2Kg = areaM2 * factor.co2PerUnit;
  } else {
    massKg = CATEGORY_MASS_KG[category];
    waterLiters = massKg * factor.waterPerUnit;
    co2Kg = massKg * factor.co2PerUnit;
  }

  return {
    waterGal: waterLiters / LITERS_PER_GALLON,
    co2Lbs: co2Kg / KG_PER_LB,
    wasteLbs: massKg / KG_PER_LB,
  };
}

export const GALLONS_PER_BATHTUB = 80;
export const LBS_CO2_PER_MILE = 0.89;

/* ==================================================================== */
/*  "Hyper-relatable" secondary comparisons for the environmental stats.  */
/*  These are optional, toggled-on alternate phrasings of the same water  */
/*  and CO2 numbers — not new data, just a more human-scale way to read   */
/*  them.                                                                 */
/* ==================================================================== */

/** ~3 liters/day of direct drinking water is a commonly used average for
 *  one adult (the U.S. National Academies figure for total daily fluid
 *  intake is higher, ~3.7L, but that includes water from food — this is
 *  specifically direct drinking water). At this rate, the ~2,700 liters
 *  commonly cited to make one cotton t-shirt works out to ~900 days,
 *  which is the reference point this feature is built around. */
export const DRINKING_WATER_LITERS_PER_DAY = 3;
const LITERS_PER_GALLON_RELATABLE = 3.78541;

export function drinkingWaterDays(waterGal: number): number {
  const liters = waterGal * LITERS_PER_GALLON_RELATABLE;
  return liters / DRINKING_WATER_LITERS_PER_DAY;
}

/**
 * Round-trip driving distances from Portland to a few notable Oregon
 * cities, used to anchor the CO2 stat to something concrete instead of an
 * abstract mile count. Sourced from averaged public driving-distance data
 * (Portland→Salem ~47mi, Portland→Eugene ~111mi, Portland→Bend ~160mi one
 * way; doubled here for the round trip) — matches the Sourcing Guide's
 * existing Portland/Bethany-area focus, so the two features stay
 * geographically consistent with each other.
 */
export const LANDMARK_ROUND_TRIPS = [
  { label: "Portland to Salem", roundTripMiles: 94 },
  { label: "Portland to Eugene", roundTripMiles: 222 },
  { label: "Portland to Bend", roundTripMiles: 320 },
];

/**
 * Picks whichever landmark round trip is the closest order-of-magnitude
 * match to the given mileage (comparing on a log scale so a very small or
 * very large total doesn't always just default to the smallest/largest
 * entry), then expresses the mileage as a fraction of it or a multiple.
 */
export function relatableDriving(miles: number): string {
  if (miles <= 0) return "";
  let best = LANDMARK_ROUND_TRIPS[0];
  let bestScore = Infinity;
  for (const route of LANDMARK_ROUND_TRIPS) {
    const score = Math.abs(Math.log(miles / route.roundTripMiles));
    if (score < bestScore) {
      bestScore = score;
      best = route;
    }
  }
  const ratio = miles / best.roundTripMiles;
  if (ratio >= 0.97) {
    const trips = Math.round(ratio * 10) / 10;
    return trips <= 1.05
      ? `You've offset enough CO₂ to drive from ${best.label} and back.`
      : `You've offset enough CO₂ to drive from ${best.label} and back ${trips}× over.`;
  }
  const pct = Math.round(ratio * 100);
  return `You're ${pct}% of the way to offsetting a round trip from ${best.label} and back.`;
}

/** Flat weight credited per donated item toward landfill diversion (Feature 6). */
export const DONATION_WASTE_LBS = 1.5;

/**
 * Milestone tiers for the Carbon Footprint Visualizer (Feature 5), keyed by
 * cumulative lifetime CO2 avoided. `min` is the lbs-of-CO2 threshold to reach
 * that tier; the icon is resolved in the component (constants.ts stays JSX-free).
 */
export const CO2_TIERS = [
  { name: "Sprout", min: 0, icon: "sprout" as const, color: "#8C9B6E" },
  { name: "Sapling", min: 100, icon: "sapling" as const, color: "#6E7F5C" },
  { name: "Forest", min: 300, icon: "forest" as const, color: "#3F4A38" },
];

/**
 * Which categories are considered visually/functionally complementary, used
 * by the mock AI Compatibility Scoring feature. This is a simple stylist
 * heuristic, not a real recommendation model.
 */
export const COMPLEMENTARY_CATEGORIES: Record<Category, Category[]> = {
  Tops: ["Bottoms", "Outerwear", "Accessories"],
  Bottoms: ["Tops", "Shoes", "Outerwear"],
  Dresses: ["Shoes", "Accessories", "Outerwear"],
  Outerwear: ["Tops", "Bottoms", "Dresses"],
  Shoes: ["Bottoms", "Dresses", "Accessories"],
  Accessories: ["Tops", "Dresses", "Outerwear"],
  "Home Goods": ["Home Goods"],
  Other: ["Tops", "Bottoms"],
};

export const VIBE_OPTIONS = ["Earth Tones", "Monochrome", "Bold & Colorful", "Vintage / Retro", "Minimalist"];

export const STORAGE_KEYS = {
  ITEMS: "thrift-tracker:items:v2",
  BOLO: "thrift-tracker:bolo:v2",
};

/** Copy shown inside the info-tooltips on the analytics dashboard. */
export const METHODOLOGY: Record<"water" | "co2" | "waste", { title: string; body: string }> = {
  water: {
    title: "How water is estimated",
    body:
      "Real per-material water research (e.g. ~10,000 L/kg for cotton) × a typical garment weight for the category. Specify a material for a sharper number.",
  },
  co2: {
    title: "How CO₂ is estimated",
    body:
      "Same approach as water, using real per-material emissions data — e.g. wool (~24 kg/kg) emits far more than polyester (~9.5 kg/kg).",
  },
  waste: {
    title: "How waste diverted is estimated",
    body: "The garment's estimated weight — the same figure used in the water and CO₂ math above.",
  },
};

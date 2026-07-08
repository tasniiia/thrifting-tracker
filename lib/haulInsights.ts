import { ThriftItem } from "./types";
import { LBS_CO2_PER_MILE } from "./constants";

/* ==================================================================== */
/*  1. Commuter Offset — CO2 → equivalent driving miles (already a real, */
/*  grounded conversion used elsewhere in this app) → equivalent walking */
/*  steps for that same distance, using ~2,000 steps/mile — a widely     */
/*  cited average (referenced against CDC/AHA walking-pace research;      */
/*  individual stride length varies by height and fitness level).        */
/*                                                                        */
/*  Note: a direct "steps per lb of CO2" conversion isn't something that  */
/*  exists in physical reality — walking doesn't offset carbon the way   */
/*  avoiding a mile of driving does. This chains through the app's real   */
/*  CO2-per-mile figure instead of inventing a new unfounded constant.    */
/* ==================================================================== */
export const STEPS_PER_MILE = 2000;
export const DAILY_STEP_GOAL = 10000;

export function commuterOffsetSteps(co2Lbs: number): number {
  const miles = co2Lbs / LBS_CO2_PER_MILE;
  return Math.round(miles * STEPS_PER_MILE);
}

/* ==================================================================== */
/*  2. Time Traveler Span — brand founding-year lookup.                  */
/*                                                                        */
/*  Founding years below are real, verified dates for each brand's       */
/*  current corporate identity — spot-checked this session, notably      */
/*  Madewell: the modern J.Crew-owned brand relaunched in 2006 using the */
/*  name/logo of an unrelated 1937 workwear maker with no continuity     */
/*  between them, so 2006 (not 1937) is the correct "founding" year for  */
/*  the brand as it exists today.                                        */
/* ==================================================================== */
export const BRAND_FOUNDING_YEARS: Record<string, number> = {
  "levis": 1853,
  "levi's": 1853,
  "abercrombie & fitch": 1892,
  "abercrombie": 1892,
  "carhartt": 1889,
  "burberry": 1856,
  "louis vuitton": 1854,
  "chanel": 1910,
  "prada": 1913,
  "champion": 1919,
  "gucci": 1921,
  "dickies": 1922,
  "coach": 1941,
  "h&m": 1947,
  "puma": 1948,
  "adidas": 1949,
  "uniqlo": 1949,
  "new balance": 1906,
  "converse": 1908,
  "reebok": 1958,
  "vans": 1966,
  "the north face": 1966,
  "north face": 1966,
  "ralph lauren": 1967,
  "polo ralph lauren": 1967,
  "calvin klein": 1968,
  "gap": 1969,
  "urban outfitters": 1970,
  "patagonia": 1973,
  "zara": 1975,
  "american eagle": 1977,
  "banana republic": 1978,
  "guess": 1981,
  "michael kors": 1981,
  "j.crew": 1983,
  "jcrew": 1983,
  "forever 21": 1984,
  "free people": 1984,
  "tommy hilfiger": 1985,
  "dkny": 1989,
  "anthropologie": 1992,
  "kate spade": 1993,
  "old navy": 1994,
  "under armour": 1996,
  "lululemon": 1998,
  "madewell": 2006,
};

export interface FashionSpan {
  oldestBrand: string;
  oldestYear: number;
  newestBrand: string;
  newestYear: number;
  spanYears: number;
  matchedCount: number;
}

function normalizeBrand(brand: string): string {
  return brand.trim().toLowerCase();
}

/** Matches logged brands (case-insensitive, exact match after trimming)
 *  against the founding-year dictionary and returns the span between the
 *  oldest and newest match. Returns null if fewer than one brand matched
 *  (a "span" needs at least one dated point; two gives a real span). */
export function fashionHistorySpan(items: ThriftItem[]): FashionSpan | null {
  const matches: { brand: string; year: number }[] = [];
  for (const item of items) {
    if (!item.brand) continue;
    const year = BRAND_FOUNDING_YEARS[normalizeBrand(item.brand)];
    if (year !== undefined) matches.push({ brand: item.brand, year });
  }
  if (matches.length === 0) return null;
  matches.sort((a, b) => a.year - b.year);
  const oldest = matches[0];
  const newest = matches[matches.length - 1];
  return {
    oldestBrand: oldest.brand,
    oldestYear: oldest.year,
    newestBrand: newest.brand,
    newestYear: newest.year,
    spanYears: newest.year - oldest.year,
    matchedCount: matches.length,
  };
}

/* ==================================================================== */
/*  3. Liquid Asset Score — a rough resale BALLPARK, not a real          */
/*  marketplace valuation. No paid API can tell us an item's actual      */
/*  current resale value without knowing its specific condition, exact   */
/*  model, and platform demand — this is a heuristic multiplier and the  */
/*  UI says so explicitly, same treatment as the Compatibility Check's   */
/*  "stylist heuristic, not a real vision model" framing elsewhere in     */
/*  this app.                                                             */
/* ==================================================================== */
const HIGH_RESALE_BRANDS = new Set(
  [
    "levis",
    "levi's",
    "carhartt",
    "patagonia",
    "the north face",
    "north face",
    "ralph lauren",
    "polo ralph lauren",
    "coach",
    "burberry",
    "gucci",
    "chanel",
    "louis vuitton",
    "prada",
    "michael kors",
    "kate spade",
  ].map((b) => b.toLowerCase())
);

export interface LiquidAsset {
  paid: number;
  estimatedResale: number;
  multiplier: number;
}

export function liquidAssetScore(item: Pick<ThriftItem, "brand" | "category" | "pricePaid">): LiquidAsset {
  const brand = normalizeBrand(item.brand || "");
  let multiplier: number;
  if (brand && HIGH_RESALE_BRANDS.has(brand)) {
    multiplier = 3.5; // known resale-durable brands (denim, outdoor, heritage leather goods)
  } else if (item.category === "Outerwear" || item.category === "Bottoms") {
    multiplier = 2; // jackets and denim generally hold resale value better than basics
  } else {
    multiplier = 1.3; // general/fast-fashion default
  }
  return {
    paid: item.pricePaid,
    estimatedResale: Math.round(item.pricePaid * multiplier * 100) / 100,
    multiplier,
  };
}

export function totalLiquidAsset(items: ThriftItem[]) {
  const paid = items.reduce((s, i) => s + i.pricePaid, 0);
  const resale = items.reduce((s, i) => s + liquidAssetScore(i).estimatedResale, 0);
  return { paid, resale };
}

/* ==================================================================== */
/*  4. Local Purchasing Power — illustrative Portland-flavored price     */
/*  points, not researched/cited "average" prices (coffee and movie      */
/*  ticket prices vary too much shop-to-shop for a single defensible     */
/*  citation) — same treatment as the retail-tier baselines elsewhere    */
/*  in this app: a reasonable round number, clearly labeled as ballpark.  */
/* ==================================================================== */
export const LATTE_PRICE = 6;
export const MOVIE_TICKET_PRICE = 15;
/** Icon array is capped here — beyond this many cups/tickets it becomes
 *  visual noise rather than a tangible count, and switches to a "+N" style
 *  summary instead. */
export const MAX_ICONS_SHOWN = 24;

export function purchasingPower(totalSaved: number) {
  return {
    lattes: Math.floor(totalSaved / LATTE_PRICE),
    movieTickets: Math.floor(totalSaved / MOVIE_TICKET_PRICE),
  };
}

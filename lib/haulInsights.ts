import { ThriftItem } from "./types";

/* ==================================================================== */
/*  1. Time Traveler Span — brand founding-year lookup.                  */
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
/*  2. Liquid Asset Score — a rough resale BALLPARK, not a real          */
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
/*  3. Local Purchasing Power — illustrative Portland-flavored price     */
/*  points, not researched/cited "average" prices (coffee, movie ticket, */
/*  and used-book prices all vary too much shop-to-shop for a single     */
/*  defensible citation) — same treatment as the retail-tier baselines   */
/*  elsewhere in this app: a reasonable round number, clearly labeled as */
/*  ballpark. Powell's Books was picked as the third comparison over     */
/*  something generic specifically because it's a real, iconic Portland */
/*  secondhand institution — it fits this app's world better than a      */
/*  random national chain would.                                        */
/* ==================================================================== */
export const LATTE_PRICE = 6;
export const MOVIE_TICKET_PRICE = 15;
export const USED_BOOK_PRICE = 8;

export function purchasingPower(totalSaved: number) {
  return {
    lattes: Math.floor(totalSaved / LATTE_PRICE),
    movieTickets: Math.floor(totalSaved / MOVIE_TICKET_PRICE),
    books: Math.floor(totalSaved / USED_BOOK_PRICE),
  };
}

/** Small seeded PRNG (mulberry32) — same technique already used for the
 *  Haul Flex receipt's barcode, so the split below is stable for the same
 *  underlying data instead of jittering on every re-render. */
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Splits the total saved across all three comparisons at once (randomized
 * but seed-stable proportions) instead of showing each as an independent
 * "or" alternative for the full amount. E.g. "roughly 30 lattes, 12 movie
 * tickets, and 5 Powell's books" — a single combined, additive picture,
 * rather than three separate framings of the same number that need an
 * explicit "or" to avoid looking like they should be summed.
 *
 * Each category is guaranteed at least 1 whenever the total can actually
 * cover one of each (a $29 combined minimum) — only the remainder above
 * that gets randomly split. A category only shows 0 when the total
 * genuinely can't cover all three minimums, not as an artifact of an
 * unlucky random split leaving one category starved.
 */
export function splitPurchasingPower(totalSaved: number, seed: number) {
  const rand = mulberry32(seed);
  let a = rand();
  let b = rand();
  if (a > b) [a, b] = [b, a];
  const latteShare = a;
  const movieShare = b - a;
  const bookShare = 1 - b;

  const minTotal = LATTE_PRICE + MOVIE_TICKET_PRICE + USED_BOOK_PRICE;
  if (totalSaved < minTotal) {
    // Genuinely not enough to guarantee one of each — a category can
    // legitimately be 0 here, since the math really doesn't work out.
    return {
      lattes: Math.floor((totalSaved * latteShare) / LATTE_PRICE),
      movieTickets: Math.floor((totalSaved * movieShare) / MOVIE_TICKET_PRICE),
      books: Math.floor((totalSaved * bookShare) / USED_BOOK_PRICE),
    };
  }

  const remainder = totalSaved - minTotal;
  return {
    lattes: 1 + Math.floor((remainder * latteShare) / LATTE_PRICE),
    movieTickets: 1 + Math.floor((remainder * movieShare) / MOVIE_TICKET_PRICE),
    books: 1 + Math.floor((remainder * bookShare) / USED_BOOK_PRICE),
  };
}

/* ==================================================================== */
/*  4. "Girl math" one-liner for the Haul Flex receipt — a deliberately  */
/*  silly, self-aware joke about the very real savings number, not a    */
/*  serious claim. Picked deterministically from a seed (so the same     */
/*  haul shows the same line on every re-render instead of jittering)    */
/*  rather than truly randomly.                                          */
/* ==================================================================== */
export function girlMathLine(
  params: { totalSavedFormatted: string; percentOff: number; itemCount: number },
  seed: number
): string {
  const { totalSavedFormatted, percentOff, itemCount } = params;
  const templates = [
    `girl math: saving ${totalSavedFormatted} basically means you got paid to shop`,
    `girl math: ${Math.round(percentOff)}% off is basically a bonus check`,
    "girl math: thrifted purchases don't count against the budget",
    `girl math: ${itemCount} new-to-you pieces and still under budget? basically free`,
    "girl math: secondhand savings are just free money, that's the math",
    `girl math: technically, saving ${totalSavedFormatted} is the same as earning it`,
  ];
  const idx = ((seed % templates.length) + templates.length) % templates.length;
  return templates[idx];
}

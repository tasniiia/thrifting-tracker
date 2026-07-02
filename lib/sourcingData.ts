import { Category, Store, ThriftItem } from "./types";

/**
 * Starter directory for the Portland / Bethany area. This is illustrative
 * placeholder data, not a verified business listing — swap these entries
 * for real shops you know, or wire `getRecommendations` up to a live
 * places API / your own backend later. The matching logic below is fully
 * deterministic (no external AI call needed to run this feature).
 */
export const STORE_DIRECTORY: Store[] = [
  {
    name: "Bethany Vintage Exchange",
    routeOrder: 1,
    neighborhood: "Bethany",
    categories: ["Outerwear", "Dresses", "Accessories"],
    vibe: "Curated racks, higher price point, strong on structured coats and going-out pieces.",
    priceRange: "$$$",
  },
  {
    name: "Cornell Road Thrift Collective",
    routeOrder: 2,
    neighborhood: "Bethany",
    categories: ["Tops", "Bottoms", "Home Goods"],
    vibe: "Volunteer-run and unsorted — dig-friendly, best when you have a free afternoon.",
    priceRange: "$",
  },
  {
    name: "NW 23rd Consignment",
    routeOrder: 6,
    neighborhood: "Northwest Portland",
    categories: ["Dresses", "Accessories", "Shoes"],
    vibe: "Boutique-style consignment, polished window displays, occasional designer finds.",
    priceRange: "$$$",
  },
  {
    name: "Hawthorne Reclaim",
    routeOrder: 5,
    neighborhood: "SE Hawthorne",
    categories: ["Outerwear", "Bottoms", "Accessories"],
    vibe: "Eclectic and a little punk — great denim and jacket wall, unpredictable sizing.",
    priceRange: "$$",
  },
  {
    name: "Alberta Arts Trade Shop",
    routeOrder: 4,
    neighborhood: "Alberta Arts District",
    categories: ["Tops", "Accessories", "Home Goods"],
    vibe: "Artist-run, rotating pop-up racks, small-batch and locally made mixed in.",
    priceRange: "$$",
  },
  {
    name: "Beaverton Community Thrift",
    routeOrder: 8,
    neighborhood: "Beaverton",
    categories: ["Home Goods", "Bottoms", "Tops", "Other"],
    vibe: "Big-box thrift energy — high volume, low prices, best for frequent short visits.",
    priceRange: "$",
  },
  {
    name: "Sellwood Shoe & Leather Co.",
    routeOrder: 7,
    neighborhood: "Sellwood",
    categories: ["Shoes", "Accessories"],
    vibe: "Specialty resale for shoes and leather goods, small but reliably well-kept stock.",
    priceRange: "$$",
  },
  {
    name: "St. Johns Swap Room",
    routeOrder: 3,
    neighborhood: "St. Johns",
    categories: ["Outerwear", "Home Goods", "Other"],
    vibe: "Laid-back neighborhood shop, strong on flannel, workwear, and household goods.",
    priceRange: "$",
  },
];

export interface Recommendation {
  store: Store;
  matchedOn: Category[];
}

/**
 * Ranks the directory by overlap with the categories the person actually
 * buys, breaking ties toward lower price points. Returns an empty array
 * (rather than throwing) when there isn't enough data yet.
 */
export function getRecommendations(topCategories: Category[], limit = 3): Recommendation[] {
  if (topCategories.length === 0) return [];
  const scored = STORE_DIRECTORY.map((store) => {
    const matchedOn = store.categories.filter((c) => topCategories.includes(c));
    return { store, matchedOn };
  }).filter((s) => s.matchedOn.length > 0);

  scored.sort((a, b) => {
    if (b.matchedOn.length !== a.matchedOn.length) return b.matchedOn.length - a.matchedOn.length;
    return a.store.priceRange.length - b.store.priceRange.length;
  });

  return scored.slice(0, limit);
}

/** Returns categories ordered by how often they show up in the ledger. */
export function topCategoriesByFrequency(items: ThriftItem[], limit = 2): Category[] {
  const counts = new Map<Category, number>();
  for (const item of items) counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([c]) => c);
}

/**
 * Mock route optimizer for the "Thrift Circuit" feature. Sorts the selected
 * stops by each store's fixed `routeOrder` — a hardcoded, illustrative
 * geographic sequence for this starter directory, not a live routing /
 * mapping API call. Swap this for a real routing service if you wire the
 * directory up to live data later.
 */
export function buildRoute(selected: Store[]): Store[] {
  return [...selected].sort((a, b) => a.routeOrder - b.routeOrder);
}

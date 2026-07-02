import { Category, Store, ThriftItem } from "./types";

/**
 * Real secondhand/thrift/consignment stores across the Portland/Beaverton
 * area, looked up live and verified (name, address, place ID) rather than
 * invented. Categories, vibe descriptions, and price tiers are this app's
 * own characterization based on that lookup (reviews, listed store types),
 * not something the stores themselves published — treat those specific
 * judgment calls as informed estimates, not official store positioning.
 * Everything else (name, address, the Google Maps link) is real and
 * independently checkable.
 *
 * This is still a snapshot, not a live feed — hours, inventory, and even
 * whether a store is still open can change after this was compiled. Wire
 * `getRecommendations` up to a live Places API if you want this to
 * self-update; the matching logic below is otherwise fully deterministic
 * and doesn't need one to run.
 */
export const STORE_DIRECTORY: Store[] = [
  {
    name: "Second Edition Resale Shop",
    routeOrder: 1,
    neighborhood: "Bethany / Cedar Mill",
    address: "1050 NW Saltzman Rd, Portland, OR 97229",
    mapsUrl: "https://www.google.com/maps/place/?q=place_id:ChIJLYveOygJlVQR0XnPTgwDV00",
    categories: ["Tops", "Bottoms", "Home Goods"],
    vibe: "Attached to the Cedar Mill Library, with proceeds supporting it directly — housewares plus a solid range of adult and kids' clothing, prices skew low.",
    priceRange: "$",
  },
  {
    name: "Beaverton ReStore (Habitat for Humanity)",
    routeOrder: 2,
    neighborhood: "Beaverton",
    address: "13475 SW Millikan Way, Beaverton, OR 97005",
    mapsUrl: "https://www.google.com/maps/place/?q=place_id:ChIJkSVUMZgOlVQR3pmyvVO-md0",
    categories: ["Home Goods", "Bottoms", "Tops", "Other"],
    vibe: "Big-box thrift energy for furniture and housewares plus a real clothing section — proceeds fund Habitat for Humanity builds.",
    priceRange: "$",
  },
  {
    name: "Consign Couture",
    routeOrder: 3,
    neighborhood: "Multnomah Village",
    address: "7871 SW Capitol Hwy, Portland, OR 97219",
    mapsUrl: "https://www.google.com/maps/place/?q=place_id:ChIJL6u5App0lVQR1xvbL_JxpGg",
    categories: ["Shoes", "Accessories", "Dresses"],
    vibe: "Designer-leaning women's consignment — shoes, bags, and jewelry alongside clothing, organized by color and size.",
    priceRange: "$$$",
  },
  {
    name: "visii",
    routeOrder: 4,
    neighborhood: "NW 23rd",
    address: "724 NW 23rd Ave, Portland, OR 97210",
    mapsUrl: "https://www.google.com/maps/place/?q=place_id:ChIJs-4-BesJlVQRO8Hg5O-AUzc",
    categories: ["Dresses", "Accessories", "Shoes"],
    vibe: "Curated vintage on trendy NW 23rd — well-kept pieces and one-of-a-kind finds, prices run a bit higher for the curation.",
    priceRange: "$$$",
  },
  {
    name: "House of Vintage",
    routeOrder: 5,
    neighborhood: "SE Hawthorne",
    address: "3315 SE Hawthorne Blvd, Portland, OR 97214",
    mapsUrl: "https://www.google.com/maps/place/?q=place_id:ChIJ3y6NlJGglVQRibjLYU90rVA",
    categories: ["Outerwear", "Bottoms", "Accessories"],
    vibe: "Massive multi-vendor space — eclectic mix, worth taking your time with, prices vary a lot stall to stall.",
    priceRange: "$$",
  },
  {
    name: "Village Merchants",
    routeOrder: 6,
    neighborhood: "SE Division",
    address: "4035 SE Division St, Portland, OR 97202",
    mapsUrl: "https://www.google.com/maps/place/?q=place_id:ChIJH1gsFYaglVQRh9KBKK-UvMI",
    categories: ["Home Goods", "Bottoms", "Tops", "Other"],
    vibe: "One of the most diverse thrift stores in Portland — clothing, housewares, and garden stuff all mixed together, worth going with time to dig.",
    priceRange: "$",
  },
  {
    name: "Broken Dreams",
    routeOrder: 7,
    neighborhood: "Alberta Arts District",
    address: "1524 NE Alberta St, Portland, OR 97211",
    mapsUrl: "https://www.google.com/maps/place/?q=place_id:ChIJ6X9ewXOnlVQRujZC6fPQ7gY",
    categories: ["Tops", "Accessories", "Home Goods"],
    vibe: "Art-gallery-meets-clothing-rack — rotating local art and records alongside a curated secondhand selection.",
    priceRange: "$$",
  },
  {
    name: "Hound and Hare Vintage",
    routeOrder: 8,
    neighborhood: "St. Johns",
    address: "7322 N Leavitt Ave, Portland, OR 97203",
    mapsUrl: "https://www.google.com/maps/place/?q=place_id:ChIJ7bkkMgColVQRxyCKJqRbKWk",
    categories: ["Outerwear", "Home Goods", "Other"],
    vibe: "Tightly curated true vintage — workwear and streetwear alike, owner-run and well known in the neighborhood.",
    priceRange: "$$",
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
 * stops by each store's fixed `routeOrder` — a hardcoded sequence based on
 * each store's real coordinates swept roughly west-to-east/north, not a
 * live routing / mapping API call. Swap this for a real routing service
 * (e.g. the Google Directions API) if you want an actually-optimized route.
 */
export function buildRoute(selected: Store[]): Store[] {
  return [...selected].sort((a, b) => a.routeOrder - b.routeOrder);
}

export type Category =
  | "Tops"
  | "Bottoms"
  | "Dresses"
  | "Outerwear"
  | "Shoes"
  | "Accessories"
  | "Home Goods"
  | "Other";

export type ItemStatus = "active" | "donated";

/** Drives the material-aware environmental impact calculation in
 *  lib/constants.ts (computeImpact). Optional so existing items logged
 *  before this field existed still work — they fall back to a blended
 *  "Mixed/Other" average. */
export type Material = "Cotton" | "Denim" | "Synthetic" | "Satin" | "Wool" | "Leather" | "Mixed/Other";

export interface ThriftItem {
  id: string;
  name: string;
  brand: string;
  category: Category;
  material?: Material;
  pricePaid: number;
  retailPrice: number;
  photo: string | null; // compressed base64 data URL, or null
  wearCount: number;
  dateAdded: string; // yyyy-mm-dd
  notes?: string;
  status: ItemStatus;
}

export interface BoloItem {
  id: string;
  name: string;
  category: Category;
  targetPrice: number;
  notes?: string;
  dateAdded: string;
}

export interface Store {
  name: string;
  neighborhood: string;
  address: string;
  /** Real Google Maps place link, built from a verified place_id — lets
   *  someone check the store (hours, current reviews, directions)
   *  themselves rather than taking the listing on faith. */
  mapsUrl: string;
  categories: Category[];
  vibe: string;
  priceRange: "$" | "$$" | "$$$";
  /** Fixed stop order for the mock "Thrift Circuit" route optimizer — a
   *  hardcoded geographic sweep based on each store's real coordinates,
   *  not a live routing call. */
  routeOrder: number;
}

export type NewThriftItem = Omit<ThriftItem, "id" | "wearCount">;
export type NewBoloItem = Omit<BoloItem, "id" | "dateAdded">;

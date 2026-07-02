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

export interface ThriftItem {
  id: string;
  name: string;
  brand: string;
  category: Category;
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
  categories: Category[];
  vibe: string;
  priceRange: "$" | "$$" | "$$$";
  /** Fixed stop order for the mock "Thrift Circuit" route optimizer — an
   *  illustrative, hardcoded geographic sequence, not a live routing call. */
  routeOrder: number;
}

export type NewThriftItem = Omit<ThriftItem, "id" | "wearCount">;
export type NewBoloItem = Omit<BoloItem, "id" | "dateAdded">;

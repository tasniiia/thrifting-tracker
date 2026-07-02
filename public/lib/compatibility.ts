import { Category, ThriftItem } from "./types";
import { COMPLEMENTARY_CATEGORIES } from "./constants";

export interface CompatibilityResult {
  score: number; // 0-100
  bestCategory: Category | null;
  matchCount: number;
}

/**
 * Mock AI Compatibility Scoring (Feature 3). Compares a hypothetical new
 * item (category + vibe) against the person's existing active items and
 * returns a deterministic "match score" plus the category it pairs best
 * with. This is a stylist heuristic based on `COMPLEMENTARY_CATEGORIES`,
 * not a real trained recommendation model — swap in a genuine
 * embedding/vision-based comparison later if you want it to be more than
 * illustrative.
 */
export function computeCompatibility(
  category: Category,
  vibe: string,
  items: ThriftItem[]
): CompatibilityResult {
  const active = items.filter((i) => i.status === "active");
  const complementary = COMPLEMENTARY_CATEGORIES[category] ?? [];

  const counts = new Map<Category, number>();
  for (const item of active) {
    if (complementary.includes(item.category)) {
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    }
  }

  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const bestCategory = ranked[0]?.[0] ?? complementary[0] ?? null;
  const matchCount = ranked[0]?.[1] ?? 0;
  const totalComplementaryOwned = [...counts.values()].reduce((s, n) => s + n, 0);

  // Deterministic "vibe bonus" so the same category+vibe pairing always
  // scores the same way, without needing a real model call.
  const vibeSeed = (vibe.length * 7 + category.length * 3) % 18;

  let score = 42 + Math.min(38, totalComplementaryOwned * 6) + vibeSeed;
  score = Math.max(8, Math.min(97, Math.round(score)));

  return { score, bestCategory, matchCount };
}

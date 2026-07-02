/**
 * Direct search-result links to major secondhand marketplaces, built from
 * whatever the person typed into a BOLO hunt-list item.
 *
 * IMPORTANT — these are plain search URLs today, not live affiliate links.
 * Poshmark and Depop don't currently run public affiliate programs; eBay
 * does (the eBay Partner Network). Each entry below has a clearly marked
 * spot to drop in a real tracking/affiliate parameter once you've signed
 * up for that marketplace's program — until then, the params are empty
 * strings and nothing is appended to the URL.
 *
 * On deep linking to the native apps: these stay as plain https:// URLs
 * rather than custom URI schemes (e.g. `ebay://`, `depop://`) on purpose.
 * eBay, Depop, and Poshmark all support Universal Links / App Links today —
 * meaning a normal https:// link like the ones below already opens directly
 * in the native app automatically when it's installed, with the mobile
 * browser as an automatic fallback when it isn't. Hand-writing custom
 * scheme URIs would be strictly worse: those schemes aren't publicly
 * documented by any of these companies, they change without notice, and
 * getting one wrong doesn't just fail to deep-link — it can throw a
 * confusing "can't open this page" error instead of the graceful browser
 * fallback a plain https:// link already gives you for free.
 */
export interface Marketplace {
  name: string;
  color: string;
  buildUrl: (query: string) => string;
  /** Hidden for non-apparel categories (Home Goods, Other) — these two
   *  marketplaces are fashion-focused and rarely useful for that search. */
  apparelOnly?: boolean;
}

/** Drop your real affiliate/referral params in here once you have them. */
const AFFILIATE_PARAMS: Record<string, string> = {
  ebay: "", // e.g. "&campid=YOUR_EPN_CAMPAIGN_ID&customid=thrift-io" once enrolled in the eBay Partner Network
  poshmark: "", // no public affiliate program as of writing
  depop: "", // no public affiliate program as of writing
  thredup: "", // e.g. an Impact/Rakuten affiliate tracking param, if you enroll
};

export const MARKETPLACES: Marketplace[] = [
  {
    name: "eBay",
    color: "#E53238",
    buildUrl: (q) => `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}${AFFILIATE_PARAMS.ebay}`,
  },
  {
    name: "Poshmark",
    color: "#7F0353",
    buildUrl: (q) => `https://poshmark.com/search?query=${encodeURIComponent(q)}${AFFILIATE_PARAMS.poshmark}`,
  },
  {
    name: "Depop",
    color: "#FF2300",
    buildUrl: (q) => `https://www.depop.com/search?q=${encodeURIComponent(q)}${AFFILIATE_PARAMS.depop}`,
    apparelOnly: true,
  },
  {
    name: "ThredUp",
    color: "#00A19A",
    buildUrl: (q) => `https://www.thredup.com/search?query=${encodeURIComponent(q)}${AFFILIATE_PARAMS.thredup}`,
    apparelOnly: true,
  },
];

const NON_APPAREL_CATEGORIES = new Set(["Home Goods", "Other"]);

/** Filters out the apparel-only marketplaces for non-apparel categories. */
export function marketplacesForCategory(category: string): Marketplace[] {
  if (!NON_APPAREL_CATEGORIES.has(category)) return MARKETPLACES;
  return MARKETPLACES.filter((m) => !m.apparelOnly);
}

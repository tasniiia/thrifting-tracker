import { ThriftItem } from "./types";

/** Formats an item into a ready-to-paste reseller listing (Depop/Poshmark/eBay style). */
export function buildListingText(item: ThriftItem): string {
  const title = item.brand ? `${item.brand} ${item.name}` : item.name;
  return [
    `🔥 ${title}`,
    `👕 Category: ${item.category}`,
    `💰 Est Retail: $${Math.round(item.retailPrice)}`,
    `✨ Excellent pre-loved condition. Sourced sustainably via Thrift I/O.`,
  ].join("\n");
}

/**
 * Copies the listing text to the clipboard. Returns whether it succeeded so
 * the caller can show an appropriate toast — clipboard access can silently
 * fail in some browser/permission contexts, so this never throws.
 */
export async function copyListingToClipboard(item: ThriftItem): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(buildListingText(item));
    return true;
  } catch {
    return false;
  }
}

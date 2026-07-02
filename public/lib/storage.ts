/**
 * localStorage wrapper that never throws. Production apps on platforms like
 * Vercel need to survive private-browsing modes, disabled storage, and
 * quota-exceeded errors (very possible here since item photos are stored as
 * base64). Every call returns a result object instead of throwing.
 */

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export function safeGet<T>(key: string, fallback: T): Result<T> {
  if (typeof window === "undefined") return { ok: true, value: fallback };
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return { ok: true, value: fallback };
    return { ok: true, value: JSON.parse(raw) as T };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not read saved data." };
  }
}

export function safeSet<T>(key: string, value: T): Result<T> {
  if (typeof window === "undefined") return { ok: true, value };
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return { ok: true, value };
  } catch (err) {
    const isQuota =
      err instanceof DOMException && (err.name === "QuotaExceededError" || err.code === 22);
    return {
      ok: false,
      error: isQuota
        ? "Storage is full — try removing an item photo or two to free up space."
        : "Couldn't save your changes locally.",
    };
  }
}

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { BoloItem, Category, NewBoloItem, NewThriftItem, ThriftItem } from "./types";
import { GALLONS_PER_BATHTUB, IMPACT_FACTORS, LBS_CO2_PER_MILE, STORAGE_KEYS } from "./constants";
import { safeGet, safeSet } from "./storage";

const uid = () => Math.random().toString(36).slice(2, 10);

export function savingsFor(item: Pick<ThriftItem, "pricePaid" | "retailPrice">) {
  return Math.max(0, item.retailPrice - item.pricePaid);
}

export function cpwFor(item: Pick<ThriftItem, "pricePaid" | "wearCount">) {
  if (item.wearCount <= 0) return null;
  return item.pricePaid / item.wearCount;
}

interface Stats {
  count: number;
  totalSpent: number;
  totalRetail: number;
  totalSaved: number;
  savingsPercent: number;
  waterGal: number;
  co2Lbs: number;
  wasteLbs: number;
  bathtubs: number;
  milesDriven: number;
  topFinds: ThriftItem[];
  topCategories: Category[];
}

interface ThriftContextValue {
  items: ThriftItem[];
  bolo: BoloItem[];
  hydrated: boolean;
  storageWarning: string | null;
  dismissWarning: () => void;
  addItem: (item: NewThriftItem) => void;
  updateItem: (id: string, patch: Partial<NewThriftItem>) => void;
  deleteItem: (id: string) => void;
  addWear: (id: string) => void;
  addBolo: (item: NewBoloItem) => void;
  updateBolo: (id: string, patch: Partial<NewBoloItem>) => void;
  deleteBolo: (id: string) => void;
  stats: Stats;
}

const ThriftContext = createContext<ThriftContextValue | null>(null);

export function ThriftProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ThriftItem[]>([]);
  const [bolo, setBolo] = useState<BoloItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);

  // hydrate once on mount (client-only, avoids SSR/CSR mismatch)
  useEffect(() => {
    const itemsRes = safeGet<ThriftItem[]>(STORAGE_KEYS.ITEMS, []);
    if (itemsRes.ok) setItems(itemsRes.value);
    else setStorageWarning(itemsRes.error);

    const boloRes = safeGet<BoloItem[]>(STORAGE_KEYS.BOLO, []);
    if (boloRes.ok) setBolo(boloRes.value);
    else setStorageWarning((prev) => prev ?? boloRes.error);

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const res = safeSet(STORAGE_KEYS.ITEMS, items);
    if (!res.ok) setStorageWarning(res.error);
  }, [items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const res = safeSet(STORAGE_KEYS.BOLO, bolo);
    if (!res.ok) setStorageWarning(res.error);
  }, [bolo, hydrated]);

  const addItem = useCallback((item: NewThriftItem) => {
    setItems((prev) => [...prev, { ...item, id: uid(), wearCount: 0 }]);
  }, []);

  const updateItem = useCallback((id: string, patch: Partial<NewThriftItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const addWear = useCallback((id: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, wearCount: it.wearCount + 1 } : it)));
  }, []);

  const addBolo = useCallback((item: NewBoloItem) => {
    setBolo((prev) => [...prev, { ...item, id: uid(), dateAdded: new Date().toISOString().slice(0, 10) }]);
  }, []);

  const updateBolo = useCallback((id: string, patch: Partial<NewBoloItem>) => {
    setBolo((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }, []);

  const deleteBolo = useCallback((id: string) => {
    setBolo((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const stats: Stats = useMemo(() => {
    const totalSpent = items.reduce((s, i) => s + i.pricePaid, 0);
    const totalRetail = items.reduce((s, i) => s + i.retailPrice, 0);
    const totalSaved = items.reduce((s, i) => s + savingsFor(i), 0);
    const savingsPercent = totalRetail > 0 ? Math.round((totalSaved / totalRetail) * 100) : 0;

    const waterGal = items.reduce((s, i) => s + IMPACT_FACTORS[i.category].waterGal, 0);
    const co2Lbs = items.reduce((s, i) => s + IMPACT_FACTORS[i.category].co2Lbs, 0);
    const wasteLbs = items.reduce((s, i) => s + IMPACT_FACTORS[i.category].wasteLbs, 0);

    const counts = new Map<Category, number>();
    for (const it of items) counts.set(it.category, (counts.get(it.category) ?? 0) + 1);
    const topCategories = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);

    return {
      count: items.length,
      totalSpent,
      totalRetail,
      totalSaved,
      savingsPercent,
      waterGal,
      co2Lbs,
      wasteLbs,
      bathtubs: waterGal / GALLONS_PER_BATHTUB,
      milesDriven: co2Lbs / LBS_CO2_PER_MILE,
      topFinds: [...items].sort((a, b) => savingsFor(b) - savingsFor(a)).slice(0, 5),
      topCategories,
    };
  }, [items]);

  const value: ThriftContextValue = {
    items,
    bolo,
    hydrated,
    storageWarning,
    dismissWarning: () => setStorageWarning(null),
    addItem,
    updateItem,
    deleteItem,
    addWear,
    addBolo,
    updateBolo,
    deleteBolo,
    stats,
  };

  return <ThriftContext.Provider value={value}>{children}</ThriftContext.Provider>;
}

export function useThrift() {
  const ctx = useContext(ThriftContext);
  if (!ctx) throw new Error("useThrift must be used inside <ThriftProvider>");
  return ctx;
}

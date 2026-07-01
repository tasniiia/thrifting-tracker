"use client";

import { MapPin, Sparkles } from "lucide-react";
import { useThrift } from "../lib/ThriftContext";
import { getRecommendations, topCategoriesByFrequency } from "../lib/sourcingData";

export function SourcingGuide() {
  const { items, stats } = useThrift();
  const topCategories = topCategoriesByFrequency(items, 2);
  const recs = getRecommendations(stats.topCategories, 3);

  return (
    <section className="bg-white border border-[#A9A290]/30 rounded-lg p-6">
      <div className="flex items-center gap-1.5">
        <Sparkles size={14} className="text-[#B5714B]" />
        <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#3F3B30]/45" style={{ fontFamily: "var(--font-mono)" }}>
          sourcing guide
        </h2>
      </div>

      {topCategories.length === 0 ? (
        <p className="text-sm text-[#3F3B30]/60 mt-3">
          Log a few finds and this will start recommending spots near Bethany / Portland that match what you actually buy.
        </p>
      ) : (
        <>
          <p className="text-sm text-[#3F3B30]/70 mt-3">
            You shop <span className="font-semibold text-[#333829]">{topCategories.join(" & ")}</span> the most — here's
            where that tends to show up around Bethany and Portland.
          </p>

          <div className="mt-4 flex flex-col gap-3">
            {recs.map((r) => (
              <div key={r.store.name} className="border border-[#A9A290]/25 rounded-lg p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-[14px]">{r.store.name}</p>
                    <p className="text-[12px] text-[#3F3B30]/50 flex items-center gap-1 mt-0.5">
                      <MapPin size={11} /> {r.store.neighborhood}
                    </p>
                  </div>
                  <span className="text-[12px] text-[#3F3B30]/40" style={{ fontFamily: "var(--font-mono)" }}>
                    {r.store.priceRange}
                  </span>
                </div>
                <p className="text-[13px] text-[#3F3B30]/65 mt-2">{r.store.vibe}</p>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {r.matchedOn.map((c) => (
                    <span
                      key={c}
                      className="text-[10px] uppercase tracking-wide bg-[#EDE8DC] text-[#3F3B30]/60 rounded-full px-2 py-0.5"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="text-[11px] text-[#3F3B30]/40 mt-4">
        Starter directory — not a live business listing. Swap in shops you actually know, or connect this to a live
        places API for real-time recommendations.
      </p>
    </section>
  );
}

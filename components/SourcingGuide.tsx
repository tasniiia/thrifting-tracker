"use client";

import { useMemo, useState } from "react";
import { MapPin, Sparkles, Route, X } from "lucide-react";
import { useThrift } from "../lib/ThriftContext";
import { getRecommendations, topCategoriesByFrequency, buildRoute } from "../lib/sourcingData";

export function SourcingGuide() {
  const { items, stats } = useThrift();
  const topCategories = topCategoriesByFrequency(items, 2);
  const recs = useMemo(() => getRecommendations(stats.topCategories, 3), [stats.topCategories]);
  const [planningRoute, setPlanningRoute] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggleStore(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function togglePlanningMode() {
    setPlanningRoute((v) => !v);
    setSelected(new Set()); // start clean each time route-planning is opened
  }

  const selectedStores = recs.map((r) => r.store).filter((s) => selected.has(s.name));
  const route = selectedStores.length >= 2 ? buildRoute(selectedStores) : [];

  return (
    <section className="bg-white border border-[#A9A290]/30 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} className="text-[#B5714B]" />
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#3F3B30]/45" style={{ fontFamily: "var(--font-mono)" }}>
            sourcing guide
          </h2>
        </div>
        {topCategories.length > 0 && recs.length >= 2 && (
          <button
            onClick={togglePlanningMode}
            className={`flex items-center gap-1 text-[11px] font-medium rounded-full px-2.5 py-1 transition-colors ${
              planningRoute
                ? "bg-[#333829] text-[#F4F1E8]"
                : "text-[#4F5B3E] border border-[#4F5B3E]/30 hover:bg-[#4F5B3E]/10"
            }`}
          >
            {planningRoute ? (
              <>
                <X size={11} /> Cancel
              </>
            ) : (
              <>
                <Route size={11} /> Plan a route
              </>
            )}
          </button>
        )}
      </div>

      {topCategories.length === 0 ? (
        <p className="text-sm text-[#3F3B30]/60 mt-3">
          Log a few finds and this will start recommending real spots around Portland and Beaverton that match what
          you actually buy.
        </p>
      ) : (
        <>
          <p className="text-sm text-[#3F3B30]/70 mt-3">
            You shop <span className="font-semibold text-[#333829]">{topCategories.join(" & ")}</span> the most — here's
            where that tends to show up around Portland and Beaverton.
          </p>

          {/* Thrift Circuit — only exists while actively planning a route (Feature 4) */}
          {planningRoute && route.length >= 2 && (
            <div className="mt-4 bg-[#EDE8DC] rounded-lg p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Route size={14} className="text-[#4F5B3E]" />
                <p className="text-[11px] uppercase tracking-wide text-[#3F3B30]/60 font-medium">
                  Thrift Circuit · {route.length} stops
                </p>
              </div>
              <ol className="ml-1.5">
                {route.map((store, i) => (
                  <li key={store.name} className="relative pl-6 pb-4 last:pb-0 border-l border-dashed border-[#A9A290]/60 last:border-transparent">
                    <span className="absolute -left-[7px] top-0 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#4F5B3E] text-white">
                      <MapPin size={9} />
                    </span>
                    <p className="text-[13px] font-medium leading-tight">
                      Stop {i + 1}: {store.name}
                    </p>
                    <a
                      href={store.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#3F3B30]/50 hover:text-[#4F5B3E] hover:underline"
                    >
                      {store.address}
                    </a>
                  </li>
                ))}
              </ol>
              <p className="text-[10px] text-[#3F3B30]/40 mt-1">
                Stop order is a fixed sequence based on real store locations, not a live routing call — for an
                actually-optimized route, paste these addresses into Google Maps.
              </p>
            </div>
          )}

          {planningRoute && route.length === 1 && (
            <p className="text-[11px] text-[#3F3B30]/45 mt-3">Pick one more stop below to build a route.</p>
          )}

          <div className="mt-4 flex flex-col gap-3">
            {recs.map((r) => {
              const isSelected = selected.has(r.store.name);
              return (
                <div
                  key={r.store.name}
                  className={`border rounded-lg p-4 transition-colors ${
                    planningRoute && isSelected ? "border-[#4F5B3E]/50 bg-[#4F5B3E]/[0.04]" : "border-[#A9A290]/25"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      {planningRoute && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleStore(r.store.name)}
                          aria-label={`Add ${r.store.name} to route`}
                          className="mt-1 accent-[#4F5B3E] w-3.5 h-3.5"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-[14px]">{r.store.name}</p>
                        <a
                          href={r.store.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[12px] text-[#3F3B30]/50 hover:text-[#4F5B3E] hover:underline flex items-start gap-1 mt-0.5"
                        >
                          <MapPin size={11} className="mt-0.5 shrink-0" />
                          <span>
                            {r.store.neighborhood} · {r.store.address}
                          </span>
                        </a>
                      </div>
                    </div>
                    <span className="text-[12px] text-[#3F3B30]/40" style={{ fontFamily: "var(--font-mono)" }}>
                      {r.store.priceRange}
                    </span>
                  </div>
                  <p className={`text-[13px] text-[#3F3B30]/65 mt-2 ${planningRoute ? "ml-6" : ""}`}>{r.store.vibe}</p>
                  <div className={`flex gap-1.5 mt-2 flex-wrap ${planningRoute ? "ml-6" : ""}`}>
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
              );
            })}
          </div>
        </>
      )}

      <p className="text-[11px] text-[#3F3B30]/40 mt-4">
        Real stores, addresses, and map links, verified as of when this list was compiled — not a live, self-updating
        feed, so double-check hours before a special trip. Tap a store's address to open it in Google Maps.
      </p>
    </section>
  );
}

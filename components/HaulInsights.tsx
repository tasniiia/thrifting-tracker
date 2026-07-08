"use client";

import { useEffect, useState } from "react";
import { Activity, Clock, TrendingUp, Coffee } from "lucide-react";
import { ThriftItem } from "../lib/types";
import { savingsFor } from "../lib/ThriftContext";
import {
  commuterOffsetSteps,
  DAILY_STEP_GOAL,
  fashionHistorySpan,
  totalLiquidAsset,
  purchasingPower,
  LATTE_PRICE,
  MOVIE_TICKET_PRICE,
  MAX_ICONS_SHOWN,
} from "../lib/haulInsights";
import { computeImpact } from "../lib/constants";
import { InfoTooltip } from "./InfoTooltip";

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/**
 * The four "hyper-visual" Haul Flex insights: Commuter Offset (steps),
 * Time Traveler Span (brand history), Liquid Asset Score (resale
 * ballpark), and Local Purchasing Power (lattes/movie tickets).
 *
 * This is a real React/Tailwind/SVG component — an on-screen section
 * inside the Haul Flex modal, not part of the canvas-rendered PNG. Since
 * the actual shareable image is drawn via canvas commands (so it can be
 * exported/shared as a single PNG), these rich HTML visualizations don't
 * automatically appear in that exported image unless the same charts are
 * separately re-implemented as canvas draw calls.
 *
 * Hydration safety: `items` already comes from a parent that only renders
 * once the app's localStorage-backed state has hydrated (see
 * ThriftProvider's `hydrated` flag), so this component never actually
 * runs during an unhydrated SSR pass. The `mounted` guard below is an
 * extra, explicit safety layer on top of that so this component is also
 * safe to reuse standalone, per the requirement.
 */
export function HaulInsights({ items }: { items: ThriftItem[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-2 gap-3 animate-pulse">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-[#EDE8DC] rounded-lg" />
        ))}
      </div>
    );
  }

  const co2Lbs = items.reduce((s, i) => s + computeImpact(i.category, i.material).co2Lbs, 0);
  const totalSaved = items.reduce((s, i) => s + savingsFor(i), 0);

  const steps = commuterOffsetSteps(co2Lbs);
  const fullGoals = Math.floor(steps / DAILY_STEP_GOAL);
  const remainderPct = ((steps % DAILY_STEP_GOAL) / DAILY_STEP_GOAL) * 100;
  const ringPct = steps < DAILY_STEP_GOAL ? (steps / DAILY_STEP_GOAL) * 100 : remainderPct;

  const span = fashionHistorySpan(items);
  const { paid, resale } = totalLiquidAsset(items);
  const power = purchasingPower(totalSaved);

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* 1. Commuter Offset */}
      <InsightCard
        icon={<Activity size={14} />}
        label="Commuter Offset"
        tooltip={{
          title: "How this is estimated",
          body: "CO₂ avoided → equivalent driving miles (already used elsewhere in this app) → equivalent walking steps for that distance, at ~2,000 steps/mile — a commonly cited average.",
        }}
      >
        <div className="flex items-center gap-3">
          <StepRing percent={steps > 0 ? ringPct : 0} />
          <div className="min-w-0">
            <p className="text-lg font-bold leading-none" style={{ fontFamily: "var(--font-mono)" }}>
              {steps.toLocaleString()}
            </p>
            <p className="text-[10px] text-[#3F3B30]/55 mt-0.5">steps offset</p>
            {fullGoals > 0 && (
              <p className="text-[9.5px] text-[#4F5B3E] mt-0.5">{fullGoals}× your 10k daily goal</p>
            )}
          </div>
        </div>
      </InsightCard>

      {/* 2. Time Traveler Span */}
      <InsightCard
        icon={<Clock size={14} />}
        label="Time Traveler"
        tooltip={{
          title: "How this works",
          body: "Matches logged brands against a small built-in dictionary of real founding years. Only brands in that list count — a lot of brands simply won't match yet.",
        }}
      >
        {span ? (
          <div>
            <p className="text-lg font-bold leading-none" style={{ fontFamily: "var(--font-mono)" }}>
              {span.spanYears}
            </p>
            <p className="text-[10px] text-[#3F3B30]/55 mt-0.5 mb-2">years of fashion history</p>
            <Timeline />
            <div className="flex justify-between text-[9px] text-[#3F3B30]/45 mt-1">
              <span className="truncate max-w-[45%]">
                {span.oldestBrand} &apos;{String(span.oldestYear).slice(-2)}
              </span>
              <span className="truncate max-w-[45%] text-right">
                {span.newestBrand} &apos;{String(span.newestYear).slice(-2)}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-[#3F3B30]/45 leading-snug">
            No recognized brands in this haul yet — try adding a brand name when you log an item.
          </p>
        )}
      </InsightCard>

      {/* 3. Liquid Asset Score */}
      <InsightCard
        icon={<TrendingUp size={14} />}
        label="Liquid Asset Score"
        tooltip={{
          title: "This is a rough ballpark, not a valuation",
          body: "A simple brand/category multiplier (1.3×–3.5×) applied to what you paid — not a real marketplace appraisal, which depends on condition, exact model, and current demand.",
        }}
      >
        <div className="flex flex-col gap-1.5">
          <ComparisonBar label="You paid" value={paid} max={Math.max(paid, resale)} color="#A9A290" />
          <ComparisonBar label="Resale ballpark" value={resale} max={Math.max(paid, resale)} color="#4F5B3E" />
        </div>
      </InsightCard>

      {/* 4. Local Purchasing Power */}
      <InsightCard
        icon={<Coffee size={14} />}
        label="Purchasing Power"
        tooltip={{
          title: "Illustrative, not researched pricing",
          body: `Assumes a $${LATTE_PRICE} latte and a $${MOVIE_TICKET_PRICE} movie ticket — reasonable round numbers, not a cited local average (prices vary a lot shop to shop).`,
        }}
      >
        {power.lattes > 0 ? (
          <>
            <IconArray count={power.lattes} />
            <p className="text-[10px] text-[#3F3B30]/55 mt-1.5">
              {power.lattes} latte{power.lattes === 1 ? "" : "s"}
              {power.movieTickets > 0 && (
                <> · or {power.movieTickets} movie ticket{power.movieTickets === 1 ? "" : "s"}</>
              )}
            </p>
          </>
        ) : (
          <p className="text-[11px] text-[#3F3B30]/45 leading-snug">Log a find to see this add up.</p>
        )}
      </InsightCard>
    </div>
  );
}

/* ==================================================================== */
/*  Shared card shell                                                    */
/* ==================================================================== */
function InsightCard({
  icon,
  label,
  tooltip,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  tooltip: { title: string; body: string };
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[#A9A290]/30 rounded-lg p-3 shadow-sm">
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-6 h-6 rounded-full bg-[#4F5B3E]/10 text-[#4F5B3E] flex items-center justify-center shrink-0">
          {icon}
        </div>
        <p className="text-[10px] uppercase tracking-wide text-[#3F3B30]/50 font-medium truncate">{label}</p>
        <InfoTooltip title={tooltip.title} body={tooltip.body} iconSize={11} />
      </div>
      {children}
    </div>
  );
}

/* ==================================================================== */
/*  1. Step progress ring                                                */
/* ==================================================================== */
function StepRing({ percent }: { percent: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = c - (clamped / 100) * c;
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className="shrink-0 -rotate-90">
      <circle cx="28" cy="28" r={r} fill="none" stroke="#EDE8DC" strokeWidth="6" />
      <circle
        cx="28"
        cy="28"
        r={r}
        fill="none"
        stroke="#4F5B3E"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

/* ==================================================================== */
/*  2. Fashion-history mini timeline                                     */
/* ==================================================================== */
function Timeline() {
  return (
    <div className="relative h-2 mt-1">
      <div className="absolute inset-y-0 left-0 right-0 my-auto h-[2px] bg-[#A9A290]/40 rounded-full" />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#B5714B]" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#4F5B3E]" />
    </div>
  );
}

/* ==================================================================== */
/*  3. Paid vs. resale comparison bars                                   */
/* ==================================================================== */
function ComparisonBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.max(4, (value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-[9.5px] text-[#3F3B30]/55 mb-0.5">
        <span>{label}</span>
        <span style={{ fontFamily: "var(--font-mono)" }}>{currency(value)}</span>
      </div>
      <div className="h-2 rounded-full bg-[#EDE8DC] overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

/* ==================================================================== */
/*  4. Icon array (coffee cups), capped with a "+N" summary beyond that   */
/* ==================================================================== */
function IconArray({ count }: { count: number }) {
  const shown = Math.min(count, MAX_ICONS_SHOWN);
  const overflow = count - shown;
  return (
    <div className="flex flex-wrap gap-1">
      {Array.from({ length: shown }).map((_, i) => (
        <Coffee key={i} size={13} className="text-[#4F5B3E]" />
      ))}
      {overflow > 0 && <span className="text-[10px] text-[#3F3B30]/50 self-center ml-0.5">+{overflow}</span>}
    </div>
  );
}

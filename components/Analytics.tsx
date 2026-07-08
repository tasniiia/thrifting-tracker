"use client";

import { useState } from "react";
import { Droplet, Leaf, Cloud, Sprout, TreeDeciduous, Trees, Gift, ExternalLink, Clock, TrendingUp, Coffee, Ticket, BookOpen, ArrowRight, type LucideIcon } from "lucide-react";
import { useThrift } from "../lib/ThriftContext";
import { METHODOLOGY, relatableWater, relatableDriving } from "../lib/constants";
import { fashionHistorySpan, totalLiquidAsset, splitPurchasingPower, LATTE_PRICE, MOVIE_TICKET_PRICE, USED_BOOK_PRICE } from "../lib/haulInsights";
import { InfoTooltip } from "./InfoTooltip";

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const TIER_ICONS = { sprout: Sprout, sapling: TreeDeciduous, forest: Trees } as const;

export function Analytics() {
  const { items, stats } = useThrift();
  const water = relatableWater(stats.bathtubs);
  const driving = relatableDriving(stats.milesDriven);
  // Randomized once per page load (not per re-render) — refreshing gets you
  // a new combination, but it won't reshuffle mid-session while you're
  // actively using the app, which would read as glitchy rather than fun.
  const [powerSeed] = useState(() => Math.floor(Math.random() * 1_000_000));
  const power = splitPurchasingPower(stats.totalSaved, powerSeed);
  const span = fashionHistorySpan(items);
  const { paid, resale } = totalLiquidAsset(items);

  return (
    <section className="flex flex-col gap-4">
      <div className="grid lg:grid-cols-2 gap-4">
        {/* financial */}
        <div className="bg-white border border-[#A9A290]/30 rounded-lg p-6 shadow-sm">
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#3F3B30]/45" style={{ fontFamily: "var(--font-mono)" }}>
            financial impact
          </h2>
          <p className="text-4xl mt-2 leading-none" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
            {currency(stats.totalSaved)}
          </p>
          <p className="text-sm text-[#3F3B30]/60 mt-1">
            {stats.count === 0 ? (
              "log your first find to start tracking savings"
            ) : (
              <>
                saved vs. retail
                {stats.savingsPercent > 0 && <span className="text-[#4F5B3E] font-medium"> · {stats.savingsPercent}% off</span>}
              </>
            )}
          </p>
          <div className="mt-5 pt-4 border-t border-dashed border-[#A9A290]/40 grid grid-cols-2 gap-4">
            <Stat label="Spent thrifting" value={currency(stats.totalSpent)} />
            <Stat label="Retail value" value={currency(stats.totalRetail)} />
            <Stat label="Items tracked" value={String(stats.count)} />
            <Stat label="Avg. saved / item" value={stats.count ? currency(stats.totalSaved / stats.count) : "—"} />
          </div>

          {power.lattes + power.movieTickets + power.books > 0 && (
            <div className="mt-4 pt-4 border-t border-dashed border-[#A9A290]/40">
              <div className="flex items-center gap-1.5 mb-3">
                <p className="text-[12px] text-[#3F3B30]/60">Roughly equivalent to</p>
                <InfoTooltip
                  title="Illustrative, not researched pricing"
                  body={`Your total savings split into a random (but stable) mix across three everyday prices — a $${LATTE_PRICE} latte, a $${MOVIE_TICKET_PRICE} movie ticket, and an $${USED_BOOK_PRICE} used book at Powell's. Reasonable round numbers, not cited local averages.`}
                  iconSize={11}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <PowerColumn icon={Coffee} count={power.lattes} label="lattes" color="#4F5B3E" />
                <PowerColumn icon={Ticket} count={power.movieTickets} label="movie tix" color="#B5714B" />
                <PowerColumn icon={BookOpen} count={power.books} label="Powell's books" color="#3E6E7A" />
              </div>
            </div>
          )}
        </div>

        {/* environmental — leads with the human-scale ("relatable") framing,
           with the raw literal figures kept as a secondary detail line
           rather than a separate toggle-able view */}
        <div className="bg-white border border-[#A9A290]/30 rounded-lg p-6 shadow-sm">
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#3F3B30]/45" style={{ fontFamily: "var(--font-mono)" }}>
            environmental transparency
          </h2>
          <div className="mt-4 flex flex-col gap-4">
            <ImpactRow
              icon={<Droplet size={18} />}
              color="#3E6E7A"
              value={water.value}
              unit={water.unit}
              detail={`≈ ${stats.bathtubs.toFixed(1)} bathtubs of water`}
              methodologyKey="water"
            />
            {driving && (
              <ImpactRow
                icon={<Cloud size={18} />}
                color="#6E7F5C"
                value={driving.value}
                unit={driving.unit}
                detail={`≈ ${Math.round(stats.co2Lbs).toLocaleString()} lbs of CO₂ avoided`}
                methodologyKey="co2"
                link={{ label: "check this route", url: driving.mapsUrl }}
              />
            )}
            <ImpactRow
              icon={<Leaf size={18} />}
              color="#B5714B"
              value={stats.wasteLbs.toFixed(1)}
              unit="lbs of waste diverted"
              methodologyKey="waste"
            />
          </div>
        </div>
      </div>

      {/* carbon footprint visualizer (Feature 5) */}
      <div className="bg-white border border-[#A9A290]/30 rounded-lg p-6 shadow-sm">
        <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#3F3B30]/45" style={{ fontFamily: "var(--font-mono)" }}>
          carbon footprint visualizer
        </h2>

        <div className="grid sm:grid-cols-2 gap-6 mt-4">
          {/* water — row of droplets that fill in */}
          <div>
            <p className="text-[12px] text-[#3F3B30]/60 mb-2">
              Water saved, one bathtub per drop <span className="text-[#3F3B30]/35">(capped at 10)</span>
            </p>
            <DropletRow bathtubs={stats.bathtubs} />
          </div>

          {/* CO2 — milestone tiers */}
          <div>
            <p className="text-[12px] text-[#3F3B30]/60 mb-2">Lifetime CO₂ milestone</p>
            <TierBadge
              co2Lbs={stats.co2Lbs}
              tier={stats.co2Tier}
              nextTier={stats.co2NextTier}
              progress={stats.co2TierProgress}
            />
          </div>
        </div>

        {stats.donatedCount > 0 && (
          <div className="mt-6 pt-5 border-t border-dashed border-[#A9A290]/40 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-[#B5714B]/10 text-[#B5714B]">
              <Gift size={17} />
            </div>
            <div>
              <p className="text-sm">
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{stats.donatedWasteLbs.toFixed(1)} lbs</span>{" "}
                diverted from landfill by donating{" "}
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{stats.donatedCount}</span> item
                {stats.donatedCount === 1 ? "" : "s"}
              </p>
              <p className="text-[11px] text-[#3F3B30]/45">Estimated at 1.5 lbs per donated item.</p>
            </div>
          </div>
        )}
      </div>

      {/* Closet Character — fun, explicitly illustrative insights, kept
         visually and tonally separate from the hard financial/environmental
         numbers above since both of these are heuristics, not facts. */}
      {(span || paid > 0) && (
        <div className="bg-white border border-[#A9A290]/30 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-1.5">
            <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#3F3B30]/45" style={{ fontFamily: "var(--font-mono)" }}>
              closet character
            </h2>
            <span className="text-[10px] text-[#3F3B30]/35">(fun, illustrative — not hard data)</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mt-4">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Clock size={13} className="text-[#B5714B]" />
                <p className="text-[12px] text-[#3F3B30]/60">Time Traveler Span</p>
                <InfoTooltip
                  title="How this works"
                  body="Matches logged brands against a small built-in dictionary of real founding years. Only brands in that list count — a lot of brands simply won't match yet."
                  iconSize={11}
                />
              </div>
              {span ? (
                <div>
                  <p className="text-2xl font-bold leading-none" style={{ fontFamily: "var(--font-display)" }}>
                    {span.spanYears}{" "}
                    <span className="text-sm font-normal text-[#3F3B30]/60">years apart</span>
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <BrandChip brand={span.oldestBrand} year={span.oldestYear} />
                    <ArrowRight size={14} className="text-[#A9A290] shrink-0" />
                    <BrandChip brand={span.newestBrand} year={span.newestYear} />
                  </div>
                  <p className="text-[10.5px] text-[#3F3B30]/40 mt-2">
                    Based on {span.matchedCount} recognized brand{span.matchedCount === 1 ? "" : "s"} in your closet
                  </p>
                </div>
              ) : (
                <p className="text-[12px] text-[#3F3B30]/45 leading-snug">
                  No recognized brands yet — add a brand name when logging an item to unlock this.
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp size={13} className="text-[#4F5B3E]" />
                <p className="text-[12px] text-[#3F3B30]/60">Liquid Asset Score</p>
                <InfoTooltip
                  title="This is a rough ballpark, not a valuation"
                  body="A simple brand/category multiplier (1.3×–3.5×) applied to what you paid — not a real marketplace appraisal, which depends on condition, exact model, and current demand."
                  iconSize={11}
                />
              </div>
              {paid > 0 ? (
                <div className="flex flex-col gap-2">
                  <ComparisonBar label="You paid" value={paid} max={Math.max(paid, resale)} color="#A9A290" />
                  <ComparisonBar label="Resale ballpark" value={resale} max={Math.max(paid, resale)} color="#4F5B3E" />
                </div>
              ) : (
                <p className="text-[12px] text-[#3F3B30]/45 leading-snug">Log a find to see this estimate.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function DropletRow({ bathtubs }: { bathtubs: number }) {
  const total = 10;
  const filled = Math.min(total, Math.round(bathtubs));
  const overflow = bathtubs > total;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {Array.from({ length: total }).map((_, i) => (
        <Droplet
          key={i}
          size={19}
          className={i < filled ? "text-[#3E6E7A]" : "text-[#A9A290]/25"}
          fill={i < filled ? "#3E6E7A" : "transparent"}
        />
      ))}
      <span className="ml-1 text-[13px] text-[#3F3B30]/60" style={{ fontFamily: "var(--font-mono)" }}>
        {bathtubs.toFixed(1)}
        {overflow ? "+" : ""}
      </span>
    </div>
  );
}

function TierBadge({
  co2Lbs,
  tier,
  nextTier,
  progress,
}: {
  co2Lbs: number;
  tier: { name: string; icon: keyof typeof TIER_ICONS; color: string };
  nextTier: { name: string; min: number } | null;
  progress: number;
}) {
  const Icon = TIER_ICONS[tier.icon];
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${tier.color}1F`, color: tier.color }}
        >
          <Icon size={22} />
        </div>
        <div>
          <p className="font-medium text-[15px]" style={{ fontFamily: "var(--font-display)" }}>
            {tier.name}
          </p>
          <p className="text-[12px] text-[#3F3B30]/50">{Math.round(co2Lbs).toLocaleString()} lbs CO₂ avoided</p>
        </div>
      </div>

      {nextTier ? (
        <div className="mt-3">
          <div className="h-2 rounded-full bg-[#EDE8DC] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: tier.color }}
            />
          </div>
          <p className="text-[11px] text-[#3F3B30]/45 mt-1.5">
            {Math.round(nextTier.min - co2Lbs).toLocaleString()} lbs to reach{" "}
            <span className="font-medium text-[#3F3B30]/70">{nextTier.name}</span>
          </p>
        </div>
      ) : (
        <p className="text-[11px] text-[#3F3B30]/45 mt-3">You've reached the top tier — nicely done.</p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-[#3F3B30]/45 mb-0.5">{label}</p>
      <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }} className="text-base">
        {value}
      </p>
    </div>
  );
}

function ImpactRow({
  icon,
  color,
  value,
  unit,
  detail,
  methodologyKey,
  link,
}: {
  icon: React.ReactNode;
  color: string;
  value: string;
  unit: string;
  detail?: string;
  methodologyKey: keyof typeof METHODOLOGY;
  link?: { label: string; url: string };
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: `${color}1A`, color }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5">
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700 }} className="text-xl sm:text-2xl leading-none">
            {value}
          </span>
          <span className="text-[13px] sm:text-sm text-[#3F3B30]/70">{unit}</span>
          <InfoTooltip {...METHODOLOGY[methodologyKey]} />
        </div>
        {(detail || link) && (
          <p className="text-[12px] text-[#3F3B30]/45 mt-0.5 flex items-center flex-wrap gap-x-1.5">
            {detail}
            {link && (
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-0.5 text-[#4F5B3E] hover:underline"
              >
                <ExternalLink size={10} /> {link.label}
              </a>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

/** Fashion-history mini timeline — two endpoint dots on a line. */
/** A labeled brand + founding-year chip, used in pairs (oldest → newest)
 *  in the Time Traveler widget. */
function BrandChip({ brand, year }: { brand: string; year: number }) {
  return (
    <div className="flex-1 min-w-0 bg-[#F4F1E8] rounded-lg px-2.5 py-2 border border-[#A9A290]/25">
      <p className="text-[12px] font-medium truncate">{brand}</p>
      <p className="text-[10px] text-[#3F3B30]/50" style={{ fontFamily: "var(--font-mono)" }}>
        {year}
      </p>
    </div>
  );
}

/** Paid-vs-resale (or any two-value) comparison bar. */
function ComparisonBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.max(4, (value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-[11px] text-[#3F3B30]/55 mb-1">
        <span>{label}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{currency(value)}</span>
      </div>
      <div className="h-2.5 rounded-full bg-[#EDE8DC] overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

/** Icon array (coffee cups), capped with a "+N" summary beyond that. */
/** One column of the "That's about" 3-way comparison grid: a small capped
 *  icon array, the count, and a label. */
function PowerColumn({
  icon: Icon,
  count,
  label,
  color,
}: {
  icon: LucideIcon;
  count: number;
  label: string;
  color: string;
}) {
  const shown = Math.min(count, 8);
  const overflow = count - shown;
  return (
    <div className="text-center">
      <div className="flex flex-wrap justify-center gap-0.5 mb-1.5 min-h-[16px]">
        {Array.from({ length: shown }).map((_, i) => (
          <Icon key={i} size={11} className="shrink-0" style={{ color }} />
        ))}
        {overflow > 0 && <span className="text-[9px] text-[#3F3B30]/45 self-center">+{overflow}</span>}
      </div>
      <p className="text-lg font-bold leading-none" style={{ fontFamily: "var(--font-mono)", color }}>
        {count}
      </p>
      <p className="text-[9.5px] text-[#3F3B30]/50 mt-0.5 leading-tight">{label}</p>
    </div>
  );
}

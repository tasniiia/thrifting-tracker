"use client";

import { useEffect, useRef, useState } from "react";
import { Info, Droplet, Leaf, Cloud, Sprout, TreeDeciduous, Trees, Gift } from "lucide-react";
import { useThrift } from "../lib/ThriftContext";
import { METHODOLOGY } from "../lib/constants";

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const TIER_ICONS = { sprout: Sprout, sapling: TreeDeciduous, forest: Trees } as const;

export function Analytics() {
  const { stats } = useThrift();

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
        </div>

        {/* environmental */}
        <div className="bg-white border border-[#A9A290]/30 rounded-lg p-6 shadow-sm">
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#3F3B30]/45" style={{ fontFamily: "var(--font-mono)" }}>
            environmental transparency
          </h2>
          <div className="mt-4 flex flex-col gap-4">
            <ImpactRow
              icon={<Droplet size={18} />}
              color="#3E6E7A"
              value={stats.bathtubs.toFixed(1)}
              unit="bathtubs of water"
              methodologyKey="water"
            />
            <ImpactRow
              icon={<Cloud size={18} />}
              color="#6E7F5C"
              value={Math.round(stats.co2Lbs).toLocaleString()}
              unit="lbs of CO₂ avoided"
              detail={`≈ ${Math.round(stats.milesDriven).toLocaleString()} miles of driving`}
              methodologyKey="co2"
            />
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
          size={22}
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
}: {
  icon: React.ReactNode;
  color: string;
  value: string;
  unit: string;
  detail?: string;
  methodologyKey: keyof typeof METHODOLOGY;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: `${color}1A`, color }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-1.5">
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700 }} className="text-2xl leading-none">
            {value}
          </span>
          <span className="text-sm text-[#3F3B30]/70">{unit}</span>
          <InfoTooltip {...METHODOLOGY[methodologyKey]} />
        </div>
        {detail && <p className="text-[12px] text-[#3F3B30]/45 mt-0.5">{detail}</p>}
      </div>
    </div>
  );
}

function InfoTooltip({ title, body }: { title: string; body: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={title}
        className="text-[#3F3B30]/35 hover:text-[#3F3B30]/70"
      >
        <Info size={13} />
      </button>
      {open && (
        <div className="absolute z-10 left-0 top-6 w-64 bg-[#333829] text-[#F4F1E8] text-[12px] leading-relaxed rounded-lg p-3.5 shadow-xl">
          <p className="font-semibold mb-1">{title}</p>
          <p className="text-[#F4F1E8]/80">{body}</p>
        </div>
      )}
    </div>
  );
}

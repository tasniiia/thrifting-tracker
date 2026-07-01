"use client";

import { useEffect, useRef, useState } from "react";
import { Info, Droplet, Leaf, Cloud } from "lucide-react";
import { useThrift } from "../lib/ThriftContext";
import { METHODOLOGY } from "../lib/constants";

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function Analytics() {
  const { stats } = useThrift();

  return (
    <section className="grid lg:grid-cols-2 gap-4">
      {/* financial */}
      <div className="bg-white border border-[#A9A290]/30 rounded-lg p-6">
        <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#3F3B30]/45" style={{ fontFamily: "var(--font-mono)" }}>
          financial impact
        </h2>
        <p className="text-4xl mt-2 leading-none" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
          {currency(stats.totalSaved)}
        </p>
        <p className="text-sm text-[#3F3B30]/60 mt-1">
          saved vs. retail{stats.savingsPercent > 0 && <span className="text-[#4F5B3E] font-medium"> · {stats.savingsPercent}% off</span>}
        </p>
        <div className="mt-5 pt-4 border-t border-dashed border-[#A9A290]/40 grid grid-cols-2 gap-4">
          <Stat label="Spent thrifting" value={currency(stats.totalSpent)} />
          <Stat label="Retail value" value={currency(stats.totalRetail)} />
          <Stat label="Items tracked" value={String(stats.count)} />
          <Stat label="Avg. saved / item" value={stats.count ? currency(stats.totalSaved / stats.count) : "—"} />
        </div>
      </div>

      {/* environmental */}
      <div className="bg-white border border-[#A9A290]/30 rounded-lg p-6">
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
    </section>
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

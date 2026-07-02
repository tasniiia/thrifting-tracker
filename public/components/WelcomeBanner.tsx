"use client";

import { Camera, Leaf, Receipt, Sprout } from "lucide-react";

export function WelcomeBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4F5B3E] to-[#2B3324] text-[#F4F1E8] p-8 sm:p-10 mb-8">
      {/* decorative, low-opacity leaves — pure vibe, no data */}
      <Sprout size={160} className="absolute -right-6 -top-10 text-white/[0.06] rotate-12 pointer-events-none" />
      <Leaf size={110} className="absolute right-16 bottom-[-30px] text-white/[0.08] -rotate-12 pointer-events-none" />

      <div className="relative">
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#B7C9A8]" style={{ fontFamily: "var(--font-mono)" }}>
          welcome to thrift i/o
        </p>
        <h1 className="text-2xl sm:text-3xl mt-2 max-w-md leading-snug" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
          Track everything in — and out — of your closet.
        </h1>
        <p className="text-sm text-[#F4F1E8]/70 mt-2 max-w-md">
          Money, water, CO₂, landfill waste — every purchase and donation counted, starting with your very first
          item.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mt-7">
          <Step icon={<Camera size={16} />} label="1. Log an item" detail="A purchase or a donation" />
          <Step icon={<Leaf size={16} />} label="2. See your impact" detail="Watch savings & footprint grow" />
          <Step icon={<Receipt size={16} />} label="3. Share it" detail="Flex your haul as a receipt card" />
        </div>

        <a
          href="#ledger"
          className="inline-flex items-center gap-1.5 mt-7 rounded-full bg-[#F4F1E8] text-[#2B2A22] px-5 py-2.5 text-sm font-medium hover:bg-white transition-colors"
        >
          Log your first item
        </a>
      </div>
    </div>
  );
}

function Step({ icon, label, detail }: { icon: React.ReactNode; label: string; detail: string }) {
  return (
    <div className="bg-white/[0.07] rounded-lg p-4">
      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mb-2.5">{icon}</div>
      <p className="text-[13px] font-medium">{label}</p>
      <p className="text-[12px] text-[#F4F1E8]/60 mt-0.5">{detail}</p>
    </div>
  );
}

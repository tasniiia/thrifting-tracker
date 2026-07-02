"use client";

import { Sprout } from "lucide-react";

export function EcoFactStrip() {
  return (
    <div className="flex items-center gap-2 bg-[#4F5B3E]/10 border border-[#4F5B3E]/15 text-[#3F4A38] rounded-full px-4 py-2 text-[12.5px] mb-8 w-fit">
      <Sprout size={14} className="shrink-0 text-[#4F5B3E]" />
      <span>Buying one secondhand garment instead of new can cut its water footprint by up to 90%.</span>
    </div>
  );
}

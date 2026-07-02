"use client";

import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";

export function InfoTooltip({
  title,
  body,
  align = "left",
  iconSize = 13,
}: {
  title: string;
  body: string;
  align?: "left" | "right";
  iconSize?: number;
}) {
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
        <Info size={iconSize} />
      </button>
      {open && (
        <div
          className={`absolute z-10 top-6 w-64 bg-[#333829] text-[#F4F1E8] text-[12px] leading-relaxed rounded-lg p-3.5 shadow-xl ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <p className="font-semibold mb-1">{title}</p>
          <p className="text-[#F4F1E8]/80">{body}</p>
        </div>
      )}
    </div>
  );
}

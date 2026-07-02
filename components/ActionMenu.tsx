"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";

export interface ActionMenuItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}

export function ActionMenu({
  items,
  buttonClassName,
  iconSize = 14,
}: {
  items: ActionMenuItem[];
  buttonClassName?: string;
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
        aria-label="More actions"
        className={
          buttonClassName ?? "bg-[#F4F1E8]/95 rounded-full p-1.5 shadow-sm hover:bg-white text-[#3F3B30]/70"
        }
      >
        <MoreVertical size={iconSize} />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-20 w-44 bg-white rounded-lg shadow-xl border border-[#A9A290]/20 py-1 overflow-hidden">
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-left hover:bg-[#F4F1E8] transition-colors ${
                item.danger ? "text-[#A6503B]" : "text-[#3F3B30]"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

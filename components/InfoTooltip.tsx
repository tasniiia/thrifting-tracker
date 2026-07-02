"use client";

import { useEffect, useRef, useState } from "react";
import { Info, ExternalLink } from "lucide-react";

export interface TooltipSource {
  label: string;
  url: string;
}

export function InfoTooltip({
  title,
  body,
  sources,
  iconSize = 13,
}: {
  title: string;
  body: string;
  sources?: TooltipSource[];
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
        // Centered under the icon and width-clamped to the viewport (not a
        // fixed 256px box) so it can never spill off the edge of a phone
        // screen regardless of where the icon sits in the layout.
        <div className="absolute z-20 top-6 left-1/2 -translate-x-1/2 w-[min(240px,82vw)] bg-[#333829] text-[#F4F1E8] text-[11.5px] leading-snug rounded-lg p-3 shadow-xl">
          <p className="font-semibold mb-1">{title}</p>
          <p className="text-[#F4F1E8]/80">{body}</p>
          {sources && sources.length > 0 && (
            <div className="mt-2 pt-2 border-t border-white/15 flex flex-col gap-1">
              {sources.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#F4F1E8]/70 hover:text-[#F4F1E8] underline underline-offset-2"
                >
                  <ExternalLink size={10} className="shrink-0" />
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

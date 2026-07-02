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
        <>
          {/* Mobile: a subtle backdrop so the viewport-anchored popup below
             reads clearly as a small overlay, not a stray floating box. */}
          <div
            className="fixed inset-0 z-10 bg-black/10 sm:hidden"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          {/*
            Mobile: anchored to the VIEWPORT (fixed, centered, margin from
            the edges) rather than to the icon's own position — an
            icon-relative popup can sit near a screen edge and push a
            fixed-width box off-screen even with a clamped width, since the
            clamp only limits the box's size, not where it starts. Fixed
            positioning sidesteps that entirely.
            Desktop (sm:): reverts to the compact dropdown centered under
            the icon, since wide screens have enough margin either way.
          */}
          <div
            className="fixed sm:absolute left-4 right-4 sm:left-1/2 sm:right-auto bottom-6 sm:bottom-auto top-auto sm:top-6 sm:-translate-x-1/2 z-20 w-auto sm:w-[min(240px,82vw)] max-w-[420px] mx-auto sm:mx-0 bg-[#333829] text-[#F4F1E8] text-[11.5px] leading-snug rounded-lg p-3.5 sm:p-3 shadow-xl"
            style={{ paddingBottom: "max(0.875rem, env(safe-area-inset-bottom))" }}
          >
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
        </>
      )}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";

/**
 * Shared modal shell: a centered dialog on desktop, a bottom sheet on
 * mobile (matches the PRD's "thumb zone" requirement — primary content and
 * CTAs sit near the bottom of the screen instead of forcing a stretch to
 * the center). Supports swipe-down-to-dismiss on touch devices and pads its
 * bottom edge for the iOS/Android safe area automatically.
 */
export function BottomSheet({
  onClose,
  children,
  maxWidth = "sm:max-w-sm",
  zIndex = 50,
}: {
  onClose: () => void;
  children: React.ReactNode;
  /** Tailwind max-width class applied at the `sm:` breakpoint and up. */
  maxWidth?: string;
  /** Raise above other open sheets (e.g. a confirm dialog over a form). */
  zIndex?: number;
}) {
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef<number | null>(null);
  const scrollTop = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  function handleTouchStart(e: React.TouchEvent) {
    // Only start a dismiss-drag if the sheet is scrolled to the top —
    // otherwise a swipe-down inside a long scrollable form would fight
    // with normal scrolling instead of scrolling it.
    scrollTop.current = sheetRef.current?.scrollTop ?? 0;
    if (scrollTop.current > 0) return;
    startY.current = e.touches[0].clientY;
    setDragging(true);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (startY.current === null) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) setDragY(delta);
  }

  function handleTouchEnd() {
    if (dragY > 110) {
      onClose();
    }
    setDragY(0);
    setDragging(false);
    startY.current = null;
  }

  return (
    <div
      className="fixed inset-0 bg-[#2B2A22]/45 backdrop-blur-[2px] flex items-end sm:items-center justify-center"
      style={{ zIndex }}
    >
      <div
        ref={sheetRef}
        className={`bg-[#F4F1E8] w-full ${maxWidth} sm:rounded-lg rounded-t-2xl relative max-h-[92vh] overflow-y-auto overscroll-contain`}
        style={{
          transform: `translateY(${dragY}px)`,
          transition: dragging ? "none" : "transform 0.2s ease",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* drag handle — mobile-only visual affordance for the swipe gesture */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1" aria-hidden="true">
          <div className="w-10 h-1.5 rounded-full bg-[#A9A290]/50" />
        </div>
        <div
          className="relative p-6"
          style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * A submit/primary-action bar that sticks to the bottom of a BottomSheet as
 * its content scrolls, so the main CTA stays reachable in the thumb zone
 * even on a long form (e.g. Log an item with "+ Add details" expanded).
 */
export function StickyActionBar({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="sticky bottom-0 left-0 right-0 -mx-6 mt-5 px-6 pt-3 bg-[#F4F1E8] border-t border-[#A9A290]/20"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      {children}
    </div>
  );
}

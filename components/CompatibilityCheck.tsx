"use client";

import { useState } from "react";
import { Wand2, X } from "lucide-react";
import { useThrift } from "../lib/ThriftContext";
import { CATEGORIES, VIBE_OPTIONS } from "../lib/constants";
import { Category } from "../lib/types";
import { computeCompatibility, CompatibilityResult } from "../lib/compatibility";

export function CompatibilityCheck() {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-[#A9A290]/30 rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-1.5">
        <Wand2 size={14} className="text-[#B5714B]" />
        <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#3F3B30]/45" style={{ fontFamily: "var(--font-mono)" }}>
          compatibility check
        </h2>
      </div>
      <p className="text-sm text-[#3F3B30]/70 mt-3">
        Standing in a store deciding on something new? Check how well it'd pair with what's already in your closet.
      </p>
      <button
        onClick={() => setOpen(true)}
        className="mt-4 flex items-center gap-1.5 rounded-full bg-[#333829] text-[#F4F1E8] px-4 py-2 text-sm font-medium hover:bg-[#333829]/85 transition-colors"
      >
        <Wand2 size={14} /> Check compatibility
      </button>
      {open && <CompatibilityModal onClose={() => setOpen(false)} />}
    </div>
  );
}

function CompatibilityModal({ onClose }: { onClose: () => void }) {
  const { items } = useThrift();
  const [category, setCategory] = useState<Category>("Outerwear");
  const [vibe, setVibe] = useState(VIBE_OPTIONS[0]);
  const [result, setResult] = useState<CompatibilityResult | null>(null);

  function handleCheck() {
    setResult(computeCompatibility(category, vibe, items));
  }

  return (
    <div className="fixed inset-0 bg-[#2B2A22]/45 backdrop-blur-[2px] flex items-end sm:items-center justify-center z-50">
      <div className="bg-[#F4F1E8] w-full sm:max-w-sm sm:rounded-lg rounded-t-2xl p-6 relative">
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-[#3F3B30]/40 hover:text-[#3F3B30]">
          <X size={18} />
        </button>
        <h2 className="text-lg font-semibold mb-1" style={{ fontFamily: "var(--font-display)" }}>
          Compatibility check
        </h2>
        <p className="text-[12px] text-[#3F3B30]/55 mb-5">
          A quick stylist heuristic against your closet — not a real vision model, just a useful gut-check.
        </p>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-wide text-[#3F3B30]/50">Category</span>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as Category);
                setResult(null);
              }}
              className="modal-input"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-wide text-[#3F3B30]/50">Vibe / color story</span>
            <select
              value={vibe}
              onChange={(e) => {
                setVibe(e.target.value);
                setResult(null);
              }}
              className="modal-input"
            >
              {VIBE_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={handleCheck}
            className="rounded-full bg-[#333829] text-[#F4F1E8] py-3 text-sm font-medium hover:bg-[#333829]/85 transition-colors"
          >
            Check compatibility
          </button>

          {result && <ResultView result={result} category={category} />}
        </div>

        <style jsx global>{`
          .modal-input {
            font-family: var(--font-body);
            background: white;
            border: 1px solid rgba(169, 162, 144, 0.5);
            border-radius: 8px;
            padding: 9px 12px;
            font-size: 14px;
            outline: none;
            width: 100%;
          }
          .modal-input:focus {
            border-color: #4f5b3e;
          }
        `}</style>
      </div>
    </div>
  );
}

function ResultView({ result, category }: { result: CompatibilityResult; category: Category }) {
  const tone =
    result.score >= 75 ? "#4F5B3E" : result.score >= 45 ? "#B5714B" : "#A6503B";
  const label = result.score >= 75 ? "High match" : result.score >= 45 ? "Decent match" : "Low match";

  return (
    <div className="mt-1 flex items-center gap-4 border-t border-dashed border-[#A9A290]/40 pt-4">
      <ScoreRing score={result.score} color={tone} />
      <div>
        <p className="font-medium text-[14px]" style={{ color: tone }}>
          {label}!
        </p>
        <p className="text-[13px] text-[#3F3B30]/70 mt-0.5">
          {result.matchCount > 0 && result.bestCategory ? (
            <>
              This pairs well with your {result.matchCount} existing {result.bestCategory}
              {result.matchCount === 1 ? "" : " items"}.
            </>
          ) : (
            <>You don't have much in complementary categories yet — this {category.toLowerCase()} would be a fresh start.</>
          )}
        </p>
      </div>
    </div>
  );
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <svg width="76" height="76" viewBox="0 0 76 76" className="shrink-0 -rotate-90">
      <circle cx="38" cy="38" r={r} fill="none" stroke="#EDE8DC" strokeWidth="8" />
      <circle
        cx="38"
        cy="38"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
      <text
        x="38"
        y="42"
        textAnchor="middle"
        transform="rotate(90 38 38)"
        style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "18px", fill: color }}
      >
        {score}%
      </text>
    </svg>
  );
}

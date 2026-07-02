"use client";

import { AlertTriangle } from "lucide-react";

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
  tone = "default",
}: {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  tone?: "default" | "danger";
}) {
  return (
    <div className="fixed inset-0 bg-[#2B2A22]/45 backdrop-blur-[2px] flex items-end sm:items-center justify-center z-[60]">
      <div className="bg-[#F4F1E8] w-full sm:max-w-sm sm:rounded-lg rounded-t-2xl p-6 relative">
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
              tone === "danger" ? "bg-[#A6503B]/10 text-[#A6503B]" : "bg-[#B5714B]/10 text-[#B5714B]"
            }`}
          >
            <AlertTriangle size={17} />
          </div>
          <div>
            <h2 className="font-semibold text-[15px]" style={{ fontFamily: "var(--font-display)" }}>
              {title}
            </h2>
            <p className="text-[13px] text-[#3F3B30]/65 mt-1">{description}</p>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 rounded-full border border-[#A9A290]/40 text-[#3F3B30]/70 py-2.5 text-sm font-medium hover:bg-[#EDE8DC] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-full py-2.5 text-sm font-medium text-white transition-colors ${
              tone === "danger" ? "bg-[#A6503B] hover:bg-[#A6503B]/85" : "bg-[#333829] hover:bg-[#333829]/85"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

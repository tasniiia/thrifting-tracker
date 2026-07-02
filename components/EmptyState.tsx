"use client";

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center py-14 px-6 rounded-xl border border-dashed border-[#A9A290]/40 bg-[repeating-linear-gradient(135deg,#FBF9F3,#FBF9F3_10px,#F4F1E8_10px,#F4F1E8_20px)]">
      <div className="w-14 h-14 rounded-full bg-[#4F5B3E]/10 text-[#4F5B3E] flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="font-medium text-[16px]" style={{ fontFamily: "var(--font-display)" }}>
        {title}
      </p>
      <p className="text-sm text-[#3F3B30]/60 mt-1.5 max-w-[280px]">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 flex items-center gap-1.5 rounded-full bg-[#333829] text-[#F4F1E8] px-5 py-2.5 text-sm font-medium hover:bg-[#333829]/85 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

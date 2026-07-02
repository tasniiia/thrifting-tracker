"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  Repeat,
  ImageOff,
  ArrowUpDown,
  Clipboard,
  Gift,
  LayoutGrid,
  Rows3,
} from "lucide-react";
import { useThrift, savingsFor, cpwFor, impactScoreFor } from "../lib/ThriftContext";
import { IMPACT_FACTORS } from "../lib/constants";
import { ThriftItem } from "../lib/types";
import { copyListingToClipboard } from "../lib/listing";
import { useToast } from "../lib/Toast";
import { ItemFormModal } from "./ItemFormModal";

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

type SortKey = "newest" | "savings" | "value" | "impact" | "percentOff";
type ViewMode = "gallery" | "table";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Newest first" },
  { key: "savings", label: "Most money saved" },
  { key: "value", label: "Best value (lowest cost/wear)" },
  { key: "impact", label: "Biggest impact made" },
  { key: "percentOff", label: "Biggest % off retail" },
];

function percentOffFor(item: ThriftItem) {
  return item.retailPrice > 0 ? savingsFor(item) / item.retailPrice : 0;
}

function sortItems(items: ThriftItem[], key: SortKey): ThriftItem[] {
  const arr = [...items];
  switch (key) {
    case "newest":
      return arr.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
    case "savings":
      return arr.sort((a, b) => savingsFor(b) - savingsFor(a));
    case "value":
      return arr.sort((a, b) => {
        const ca = cpwFor(a);
        const cb = cpwFor(b);
        if (ca === null && cb === null) return 0;
        if (ca === null) return 1; // items with no wears yet sink to the bottom
        if (cb === null) return -1;
        return ca - cb;
      });
    case "impact":
      return arr.sort((a, b) => impactScoreFor(b) - impactScoreFor(a));
    case "percentOff":
      return arr.sort((a, b) => percentOffFor(b) - percentOffFor(a));
  }
}

export function Ledger() {
  const { items, addItem, updateItem, deleteItem, addWear, donateItem } = useThrift();
  const { showToast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<ThriftItem | null>(null);
  const [filter, setFilter] = useState<string>("All");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [view, setView] = useState<ViewMode>("gallery");

  // Donated items leave the active Ledger/Gallery views (Feature 6) even
  // though they still count toward the lifetime stats shown in Analytics.
  const activeItems = useMemo(() => items.filter((i) => i.status === "active"), [items]);

  const categoriesInUse = ["All", ...new Set(activeItems.map((i) => i.category))];
  const filtered = filter === "All" ? activeItems : activeItems.filter((i) => i.category === filter);
  const sorted = useMemo(() => sortItems(filtered, sortKey), [filtered, sortKey]);

  async function handleGenerateListing(item: ThriftItem) {
    const ok = await copyListingToClipboard(item);
    showToast(ok ? "Copied to clipboard!" : "Couldn't copy — try again.");
  }

  function handleDonate(item: ThriftItem) {
    donateItem(item.id);
    showToast(`Marked "${item.name}" as donated`);
  }

  return (
    <section>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#3F3B30]/45" style={{ fontFamily: "var(--font-mono)" }}>
          the ledger
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full border border-[#A9A290]/40 bg-white p-0.5">
            <button
              onClick={() => setView("gallery")}
              aria-label="Gallery view"
              aria-pressed={view === "gallery"}
              className={`rounded-full p-1.5 transition-colors ${
                view === "gallery" ? "bg-[#333829] text-[#F4F1E8]" : "text-[#3F3B30]/50 hover:text-[#3F3B30]"
              }`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setView("table")}
              aria-label="Table view"
              aria-pressed={view === "table"}
              className={`rounded-full p-1.5 transition-colors ${
                view === "table" ? "bg-[#333829] text-[#F4F1E8]" : "text-[#3F3B30]/50 hover:text-[#3F3B30]"
              }`}
            >
              <Rows3 size={14} />
            </button>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 rounded-full bg-[#333829] text-[#F4F1E8] px-4 py-2 text-sm font-medium hover:bg-[#333829]/85 transition-colors"
          >
            <Plus size={15} /> Log a find
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3 mt-4">
        {categoriesInUse.length > 2 ? (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {categoriesInUse.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`shrink-0 text-[12px] px-3 py-1.5 rounded-full border transition-colors ${
                  filter === c
                    ? "bg-[#333829] text-[#F4F1E8] border-[#333829]"
                    : "bg-white text-[#3F3B30]/70 border-[#A9A290]/40 hover:border-[#A9A290]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        ) : (
          <div />
        )}

        {activeItems.length > 1 && (
          <label className="flex items-center gap-1.5 shrink-0">
            <ArrowUpDown size={13} className="text-[#3F3B30]/40" />
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              aria-label="Sort items"
              className="text-[12px] bg-white border border-[#A9A290]/40 rounded-full pl-2.5 pr-6 py-1.5 text-[#3F3B30]/80 outline-none focus:border-[#4F5B3E]"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  Sort: {opt.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {activeItems.length === 0 ? (
        <div className="mt-4 border border-dashed border-[#A9A290]/50 rounded-lg py-14 text-center">
          <p className="text-[#3F3B30]/60 text-sm">
            {items.length === 0
              ? "Nothing logged yet. Add your first find to start the ledger."
              : "Everything here has been donated. Log a new find to keep going."}
          </p>
        </div>
      ) : view === "gallery" ? (
        <div className="mt-5 grid grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((item) => (
            <GalleryCard
              key={item.id}
              item={item}
              onWear={() => addWear(item.id)}
              onEdit={() => setEditing(item)}
              onDelete={() => deleteItem(item.id)}
              onDonate={() => handleDonate(item)}
              onGenerateListing={() => handleGenerateListing(item)}
            />
          ))}
        </div>
      ) : (
        <TableView
          items={sorted}
          onWear={(id) => addWear(id)}
          onEdit={setEditing}
          onDelete={deleteItem}
          onDonate={handleDonate}
          onGenerateListing={handleGenerateListing}
        />
      )}

      {showAdd && (
        <ItemFormModal onClose={() => setShowAdd(false)} onSubmit={(i) => { addItem(i); setShowAdd(false); }} />
      )}
      {editing && (
        <ItemFormModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={(patch) => {
            updateItem(editing.id, patch);
            setEditing(null);
          }}
        />
      )}
    </section>
  );
}

/* ==================================================================== */
/*  Gallery view — Pinterest-style visual grid (Feature 2)              */
/* ==================================================================== */
function GalleryCard({
  item,
  onWear,
  onEdit,
  onDelete,
  onDonate,
  onGenerateListing,
}: {
  item: ThriftItem;
  onWear: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDonate: () => void;
  onGenerateListing: () => void;
}) {
  const impact = IMPACT_FACTORS[item.category];
  const saved = savingsFor(item);
  const cpw = cpwFor(item);

  return (
    <div className="group relative rounded-lg overflow-hidden bg-[#EDE8DC] aspect-square">
      {item.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.photo} alt={item.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-[#A9A290]">
          <ImageOff size={28} />
        </div>
      )}

      <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#F4F1E8]/90 rounded-full px-2 py-1">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: impact.color }} />
        <span className="text-[10px] uppercase tracking-wide text-[#3F3B30]/70" style={{ fontFamily: "var(--font-mono)" }}>
          {item.category}
        </span>
      </div>

      {/* Always tappable on touch devices; a quiet fade-in on hover for desktop */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <IconButton label="Generate listing" onClick={onGenerateListing}>
          <Clipboard size={12} />
        </IconButton>
        <IconButton label="Edit" onClick={onEdit}>
          <Pencil size={12} />
        </IconButton>
        <IconButton label="Mark as donated" onClick={onDonate}>
          <Gift size={12} />
        </IconButton>
        <IconButton label="Delete" onClick={onDelete} danger>
          <Trash2 size={12} />
        </IconButton>
      </div>

      {/* name / brand overlay, gradient bar (Feature 2 spec) */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-3 pt-8 pb-2.5">
        {item.brand && <p className="text-[10px] uppercase tracking-wide text-white/70">{item.brand}</p>}
        <p className="text-[13px] font-medium text-white leading-snug truncate">{item.name}</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-[11px] text-white/85" style={{ fontFamily: "var(--font-mono)" }}>
            {currency(item.pricePaid)} <span className="text-white/50">saved {currency(saved)}</span>
          </p>
          <button
            onClick={onWear}
            aria-label="Add a wear"
            className="flex items-center gap-1 text-[10px] text-white/90 bg-white/15 rounded-full px-2 py-0.5 hover:bg-white/25"
          >
            <Repeat size={10} /> {item.wearCount}
            {cpw !== null && <span className="hidden sm:inline">· {currency(cpw)}/wear</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`bg-[#F4F1E8]/95 rounded-full p-1.5 shadow-sm hover:bg-white ${
        danger ? "text-[#A6503B]" : "text-[#3F3B30]/70"
      }`}
    >
      {children}
    </button>
  );
}

/* ==================================================================== */
/*  Table view — dense data view (Feature 2 toggle)                     */
/* ==================================================================== */
function TableView({
  items,
  onWear,
  onEdit,
  onDelete,
  onDonate,
  onGenerateListing,
}: {
  items: ThriftItem[];
  onWear: (id: string) => void;
  onEdit: (item: ThriftItem) => void;
  onDelete: (id: string) => void;
  onDonate: (item: ThriftItem) => void;
  onGenerateListing: (item: ThriftItem) => void;
}) {
  return (
    <div className="mt-5 overflow-x-auto rounded-lg border border-[#A9A290]/30 bg-white">
      <table className="w-full text-sm min-w-[720px]">
        <thead>
          <tr className="text-left border-b border-[#A9A290]/25 text-[11px] uppercase tracking-wide text-[#3F3B30]/45">
            <th className="py-3 pl-4 pr-2 font-medium">Item</th>
            <th className="py-3 px-2 font-medium">Category</th>
            <th className="py-3 px-2 font-medium text-right">Paid</th>
            <th className="py-3 px-2 font-medium text-right">Retail</th>
            <th className="py-3 px-2 font-medium text-right">Saved</th>
            <th className="py-3 px-2 font-medium text-right">Wears</th>
            <th className="py-3 pl-2 pr-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const impact = IMPACT_FACTORS[item.category];
            const saved = savingsFor(item);
            return (
              <tr key={item.id} className="border-b border-[#A9A290]/15 last:border-0 hover:bg-[#F4F1E8]/60">
                <td className="py-3 pl-4 pr-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded bg-[#EDE8DC] overflow-hidden shrink-0 flex items-center justify-center text-[#A9A290]">
                      {item.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.photo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImageOff size={14} />
                      )}
                    </div>
                    <div className="min-w-0">
                      {item.brand && <p className="text-[10px] uppercase tracking-wide text-[#3F3B30]/45 truncate">{item.brand}</p>}
                      <p className="font-medium text-[13px] truncate">{item.name}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <span className="flex items-center gap-1.5 text-[12px] text-[#3F3B30]/70">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: impact.color }} />
                    {item.category}
                  </span>
                </td>
                <td className="py-3 px-2 text-right" style={{ fontFamily: "var(--font-mono)" }}>{currency(item.pricePaid)}</td>
                <td className="py-3 px-2 text-right text-[#3F3B30]/45 line-through" style={{ fontFamily: "var(--font-mono)" }}>{currency(item.retailPrice)}</td>
                <td className="py-3 px-2 text-right text-[#4F5B3E]" style={{ fontFamily: "var(--font-mono)" }}>{currency(saved)}</td>
                <td className="py-3 px-2 text-right">
                  <button
                    onClick={() => onWear(item.id)}
                    className="text-[12px] text-[#4F5B3E] border border-[#4F5B3E]/30 rounded-full px-2 py-0.5 hover:bg-[#4F5B3E]/10"
                  >
                    +1 ({item.wearCount})
                  </button>
                </td>
                <td className="py-3 pl-2 pr-4">
                  <div className="flex items-center justify-end gap-1">
                    <IconButton label="Generate listing" onClick={() => onGenerateListing(item)}>
                      <Clipboard size={13} />
                    </IconButton>
                    <IconButton label="Edit" onClick={() => onEdit(item)}>
                      <Pencil size={13} />
                    </IconButton>
                    <IconButton label="Mark as donated" onClick={() => onDonate(item)}>
                      <Gift size={13} />
                    </IconButton>
                    <IconButton label="Delete" onClick={() => onDelete(item.id)} danger>
                      <Trash2 size={13} />
                    </IconButton>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

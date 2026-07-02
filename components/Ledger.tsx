"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  ImageOff,
  ArrowUpDown,
  Clipboard,
  Gift,
  LayoutGrid,
  Rows3,
  Shirt,
  RefreshCw,
  ChevronDown,
  Minus,
} from "lucide-react";
import { useThrift, savingsFor, cpwFor, impactScoreFor } from "../lib/ThriftContext";
import { CATEGORY_COLORS } from "../lib/constants";
import { ThriftItem } from "../lib/types";
import { copyListingToClipboard } from "../lib/listing";
import { useToast } from "../lib/Toast";
import { ItemFormModal } from "./ItemFormModal";
import { EmptyState } from "./EmptyState";
import { ConfirmDialog } from "./ConfirmDialog";
import { ActionMenu } from "./ActionMenu";

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
  const { items, addItem, updateItem, deleteItem, addWear, removeWear, donateItem, restoreItem } = useThrift();
  const { showToast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<ThriftItem | null>(null);
  const [filter, setFilter] = useState<string>("All");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [view, setView] = useState<ViewMode>("gallery");
  const [confirmingDonate, setConfirmingDonate] = useState<ThriftItem | null>(null);
  const [showDonated, setShowDonated] = useState(false);

  // Donated items leave the active Ledger/Gallery views (Feature 6) even
  // though they still count toward the lifetime stats shown in Analytics.
  const activeItems = useMemo(() => items.filter((i) => i.status === "active"), [items]);
  const donatedItems = useMemo(
    () => [...items.filter((i) => i.status === "donated")].sort((a, b) => b.dateAdded.localeCompare(a.dateAdded)),
    [items]
  );

  const categoriesInUse = ["All", ...new Set(activeItems.map((i) => i.category))];
  const filtered = filter === "All" ? activeItems : activeItems.filter((i) => i.category === filter);
  const sorted = useMemo(() => sortItems(filtered, sortKey), [filtered, sortKey]);

  async function handleGenerateListing(item: ThriftItem) {
    const ok = await copyListingToClipboard(item);
    showToast(ok ? "Copied to clipboard!" : "Couldn't copy — try again.");
  }

  function confirmDonate() {
    if (!confirmingDonate) return;
    donateItem(confirmingDonate.id);
    showToast(`Marked "${confirmingDonate.name}" as donated`);
    setConfirmingDonate(null);
  }

  function handleRestore(item: ThriftItem) {
    restoreItem(item.id);
    showToast(`"${item.name}" is back in your active closet`);
  }

  return (
    <section id="ledger">
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
            <Plus size={15} /> Log an item
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
        <div className="mt-4">
          <EmptyState
            icon={<Shirt size={22} />}
            title={items.length === 0 ? "Your closet is empty" : "Everything here has been donated"}
            description={
              items.length === 0
                ? "Log your first purchase or donation to start tracking savings and impact."
                : "Nicely done — log a new find to keep the ledger going."
            }
            actionLabel="Log an item"
            onAction={() => setShowAdd(true)}
          />
        </div>
      ) : view === "gallery" ? (
        <div className="mt-5 grid grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((item) => (
            <GalleryCard
              key={item.id}
              item={item}
              onWear={() => addWear(item.id)}
              onRemoveWear={() => removeWear(item.id)}
              onEdit={() => setEditing(item)}
              onDelete={() => deleteItem(item.id)}
              onDonate={() => setConfirmingDonate(item)}
              onGenerateListing={() => handleGenerateListing(item)}
            />
          ))}
        </div>
      ) : (
        <TableView
          items={sorted}
          onWear={(id) => addWear(id)}
          onRemoveWear={(id) => removeWear(id)}
          onEdit={setEditing}
          onDelete={deleteItem}
          onDonate={(item) => setConfirmingDonate(item)}
          onGenerateListing={handleGenerateListing}
        />
      )}

      {/* Donated items are hidden from the active views above, but stay
         reachable here so an accidental donation can be undone. */}
      {donatedItems.length > 0 && (
        <div className="mt-6 pt-5 border-t border-dashed border-[#A9A290]/40">
          <button
            onClick={() => setShowDonated((v) => !v)}
            className="flex items-center gap-1.5 text-[12px] font-medium text-[#3F3B30]/60 hover:text-[#3F3B30]"
          >
            <ChevronDown size={14} className={`transition-transform ${showDonated ? "rotate-180" : ""}`} />
            {showDonated ? "Hide" : "Show"} donated items ({donatedItems.length})
          </button>
          {showDonated && (
            <ul className="mt-3 flex flex-col gap-2">
              {donatedItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-2 border border-[#A9A290]/25 rounded-lg px-3.5 py-2.5 bg-[#EDE8DC]/40"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-[13px] truncate">{item.name}</p>
                    <p className="text-[11px] text-[#3F3B30]/50">Donated · {item.dateAdded}</p>
                  </div>
                  <button
                    onClick={() => handleRestore(item)}
                    className="flex items-center gap-1.5 text-[12px] font-medium text-[#4F5B3E] border border-[#4F5B3E]/30 rounded-full px-3 py-1.5 hover:bg-[#4F5B3E]/10 transition-colors shrink-0"
                  >
                    <RefreshCw size={12} /> Restore
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {showAdd && (
        <ItemFormModal
          onClose={() => setShowAdd(false)}
          onSubmit={(i) => {
            addItem(i);
            setShowAdd(false);
            showToast(i.status === "donated" ? "Logged as a donation — thank you!" : "Added to your ledger");
          }}
        />
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
      {confirmingDonate && (
        <ConfirmDialog
          title="Mark this as donated?"
          description={`"${confirmingDonate.name}" will leave your active closet — it'll still count toward your lifetime savings and impact stats, and you can restore it later from the "Show donated items" list if needed.`}
          confirmLabel="Yes, mark as donated"
          onConfirm={confirmDonate}
          onCancel={() => setConfirmingDonate(null)}
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
  onRemoveWear,
  onEdit,
  onDelete,
  onDonate,
  onGenerateListing,
}: {
  item: ThriftItem;
  onWear: () => void;
  onRemoveWear: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDonate: () => void;
  onGenerateListing: () => void;
}) {
  const categoryColor = CATEGORY_COLORS[item.category];
  const saved = savingsFor(item);
  const cpw = cpwFor(item);

  return (
    <div className="group relative rounded-lg overflow-hidden bg-[#EDE8DC] aspect-square shadow-sm hover:shadow-md transition-shadow">
      {item.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.photo} alt={item.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-[#A9A290]">
          <ImageOff size={28} />
        </div>
      )}

      <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#F4F1E8]/90 rounded-full px-2 py-1">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: categoryColor }} />
        <span className="text-[10px] uppercase tracking-wide text-[#3F3B30]/70" style={{ fontFamily: "var(--font-mono)" }}>
          {item.category}
        </span>
      </div>

      {/* Single overflow menu instead of 4 separate icon buttons — much
         less crowded on a narrow 2-column mobile grid, always tappable. */}
      <div className="absolute top-2 right-2">
        <ActionMenu
          items={[
            { label: "Generate listing", icon: <Clipboard size={14} />, onClick: onGenerateListing },
            { label: "Edit", icon: <Pencil size={14} />, onClick: onEdit },
            { label: "Mark as donated", icon: <Gift size={14} />, onClick: onDonate },
            { label: "Delete", icon: <Trash2 size={14} />, onClick: onDelete, danger: true },
          ]}
        />
      </div>

      {/* name / brand overlay, gradient bar (Feature 2 spec) */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-3 pt-8 pb-2.5">
        {item.brand && <p className="text-[10px] uppercase tracking-wide text-white/70">{item.brand}</p>}
        <p className="text-[13px] font-medium text-white leading-snug truncate">{item.name}</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-[11px] text-white/85" style={{ fontFamily: "var(--font-mono)" }}>
            {currency(item.pricePaid)} <span className="text-white/50">saved {currency(saved)}</span>
          </p>
          <div className="flex items-center gap-1">
            {cpw !== null && (
              <span className="hidden sm:inline text-[10px] text-white/55" style={{ fontFamily: "var(--font-mono)" }}>
                {currency(cpw)}/wear
              </span>
            )}
            <div className="flex items-center bg-white/15 rounded-full overflow-hidden">
              <button
                onClick={onRemoveWear}
                disabled={item.wearCount === 0}
                aria-label="Remove a wear"
                title="Remove a wear"
                className="w-7 h-7 flex items-center justify-center text-white/90 hover:bg-white/20 disabled:opacity-30 transition-colors"
              >
                <Minus size={10} />
              </button>
              <span
                className="text-[10px] text-white px-0.5 min-w-[14px] text-center shrink-0"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {item.wearCount}
              </span>
              <button
                onClick={onWear}
                aria-label="Add a wear"
                title="Add a wear"
                className="w-7 h-7 flex items-center justify-center text-white/90 hover:bg-white/20 transition-colors"
              >
                <Plus size={10} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================================================================== */
/*  Table view — dense data view (Feature 2 toggle), tuned so the         */
/*  essentials (item, paid, saved, wears, actions) fit on a phone         */
/*  screen without horizontal scrolling; category/retail hide on mobile.  */
/* ==================================================================== */
function TableView({
  items,
  onWear,
  onRemoveWear,
  onEdit,
  onDelete,
  onDonate,
  onGenerateListing,
}: {
  items: ThriftItem[];
  onWear: (id: string) => void;
  onRemoveWear: (id: string) => void;
  onEdit: (item: ThriftItem) => void;
  onDelete: (id: string) => void;
  onDonate: (item: ThriftItem) => void;
  onGenerateListing: (item: ThriftItem) => void;
}) {
  return (
    <div className="mt-5 overflow-x-auto rounded-lg border border-[#A9A290]/30 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-[#A9A290]/25 text-[10px] sm:text-[11px] uppercase tracking-wide text-[#3F3B30]/45">
            <th className="py-2.5 sm:py-3 pl-3 sm:pl-4 pr-2 font-medium">Item</th>
            <th className="py-2.5 sm:py-3 px-2 font-medium hidden sm:table-cell">Category</th>
            <th className="py-2.5 sm:py-3 px-2 font-medium text-right">Paid</th>
            <th className="py-2.5 sm:py-3 px-2 font-medium text-right hidden sm:table-cell">Retail</th>
            <th className="py-2.5 sm:py-3 px-2 font-medium text-right">Saved</th>
            <th className="py-2.5 sm:py-3 px-2 font-medium text-center">Wears</th>
            <th className="py-2.5 sm:py-3 pl-2 pr-2 sm:pr-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const categoryColor = CATEGORY_COLORS[item.category];
            const saved = savingsFor(item);
            return (
              <tr key={item.id} className="border-b border-[#A9A290]/15 last:border-0 hover:bg-[#F4F1E8]/60">
                <td className="py-2 sm:py-3 pl-3 sm:pl-4 pr-2">
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded bg-[#EDE8DC] overflow-hidden shrink-0 flex items-center justify-center text-[#A9A290]">
                      {item.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.photo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImageOff size={13} />
                      )}
                    </div>
                    <div className="min-w-0">
                      {item.brand && (
                        <p className="text-[9px] sm:text-[10px] uppercase tracking-wide text-[#3F3B30]/45 truncate">
                          {item.brand}
                        </p>
                      )}
                      <p className="font-medium text-[12.5px] sm:text-[13px] truncate max-w-[110px] sm:max-w-none">
                        {item.name}
                      </p>
                      {/* category dot shows on mobile in place of the hidden Category column */}
                      <span
                        className="inline-flex items-center gap-1 text-[10px] text-[#3F3B30]/50 sm:hidden mt-0.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: categoryColor }} />
                        {item.category}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2 hidden sm:table-cell">
                  <span className="flex items-center gap-1.5 text-[12px] text-[#3F3B30]/70">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: categoryColor }} />
                    {item.category}
                  </span>
                </td>
                <td className="py-2 sm:py-3 px-2 text-right text-[12.5px] sm:text-sm" style={{ fontFamily: "var(--font-mono)" }}>
                  {currency(item.pricePaid)}
                </td>
                <td
                  className="py-3 px-2 text-right text-[#3F3B30]/45 line-through hidden sm:table-cell"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {currency(item.retailPrice)}
                </td>
                <td
                  className="py-2 sm:py-3 px-2 text-right text-[#4F5B3E] text-[12.5px] sm:text-sm"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {currency(saved)}
                </td>
                <td className="py-2 sm:py-3 px-1 sm:px-2">
                  <WearBadge count={item.wearCount} onWear={() => onWear(item.id)} onRemoveWear={() => onRemoveWear(item.id)} />
                </td>
                <td className="py-2 sm:py-3 pl-1 sm:pl-2 pr-2 sm:pr-4 text-right">
                  <ActionMenu
                    items={[
                      { label: "Generate listing", icon: <Clipboard size={14} />, onClick: () => onGenerateListing(item) },
                      { label: "Edit", icon: <Pencil size={14} />, onClick: () => onEdit(item) },
                      { label: "Mark as donated", icon: <Gift size={14} />, onClick: () => onDonate(item) },
                      { label: "Delete", icon: <Trash2 size={14} />, onClick: () => onDelete(item.id), danger: true },
                    ]}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * A compact stepper for wear-tracking — increments or decrements a wear
 * count, so a mis-tap on "add a wear" (Feature request: undo an accidental
 * click) can be corrected immediately instead of living in the count
 * forever. High-contrast badge in the middle reads at a glance even in the
 * cramped mobile table.
 */
function WearBadge({
  count,
  onWear,
  onRemoveWear,
}: {
  count: number;
  onWear: () => void;
  onRemoveWear: () => void;
}) {
  return (
    <div className="flex items-center mx-auto w-fit rounded-full border border-[#4F5B3E]/30 overflow-hidden">
      <button
        onClick={onRemoveWear}
        disabled={count === 0}
        aria-label="Remove a wear"
        title="Remove a wear"
        className="w-6 h-6 flex items-center justify-center text-[#4F5B3E] hover:bg-[#4F5B3E]/10 disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
      >
        <Minus size={10} />
      </button>
      <span
        className="flex items-center justify-center w-6 h-6 bg-[#4F5B3E] text-white text-[11px] font-bold shrink-0"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {count}
      </span>
      <button
        onClick={onWear}
        aria-label="Add a wear"
        title="Add a wear"
        className="w-6 h-6 flex items-center justify-center text-[#4F5B3E] hover:bg-[#4F5B3E]/10 transition-colors"
      >
        <Plus size={10} />
      </button>
    </div>
  );
}

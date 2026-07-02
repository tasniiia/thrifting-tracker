"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, X, Sparkles, Search, ExternalLink } from "lucide-react";
import { useThrift } from "../lib/ThriftContext";
import { CATEGORIES } from "../lib/constants";
import { marketplacesForCategory } from "../lib/marketplaceLinks";
import { BoloItem, NewBoloItem, NewThriftItem } from "../lib/types";
import { ItemFormModal } from "./ItemFormModal";
import { EmptyState } from "./EmptyState";
import { ActionMenu } from "./ActionMenu";
import { useToast } from "../lib/Toast";
import { BottomSheet } from "./BottomSheet";
import { InfoTooltip } from "./InfoTooltip";

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const FOUND_MESSAGES = [
  "🎉 Found it! Let's log the details.",
  "🙌 Nice hunting! Let's add it.",
  "✨ White whale, caught. Let's log it.",
];

export function Bolo() {
  const { bolo, addBolo, updateBolo, deleteBolo, addItem } = useThrift();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BoloItem | null>(null);
  const [foundItem, setFoundItem] = useState<BoloItem | null>(null);

  function handleFound(b: BoloItem) {
    showToast(FOUND_MESSAGES[Math.floor(Math.random() * FOUND_MESSAGES.length)]);
    setFoundItem(b);
  }

  return (
    <section className="bg-white border border-[#A9A290]/30 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] text-[#3F3B30]/45 flex items-center gap-1" style={{ fontFamily: "var(--font-mono)" }}>
          BOLO wishlist
          <InfoTooltip
            title="What's a BOLO?"
            body="Be On the Look Out — thrifter slang for a specific item you're actively hunting for."
            iconSize={12}
          />
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 text-[12px] font-medium text-[#4F5B3E] border border-[#4F5B3E]/30 rounded-full px-3 py-1.5 hover:bg-[#4F5B3E]/10 transition-colors"
        >
          <Plus size={13} /> Add
        </button>
      </div>

      {bolo.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={<Search size={20} />}
            title="No white whales yet"
            description="Add a target item and price so you know exactly when to walk away."
            actionLabel="Add a hunt item"
            onAction={() => setShowForm(true)}
          />
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {bolo.map((b) => (
            <li key={b.id} className="border border-[#A9A290]/25 rounded-lg px-3.5 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-[14px] truncate">{b.name}</p>
                  <p className="text-[12px] text-[#3F3B30]/50">
                    {b.category} · under{" "}
                    <span style={{ fontFamily: "var(--font-mono)" }} className="text-[#4F5B3E]">
                      {currency(b.targetPrice)}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleFound(b)}
                    aria-label="Found it!"
                    title="Found it!"
                    className="relative w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-br from-[#E8B54D] to-[#C98A2C] text-white shadow-sm hover:shadow-md hover:scale-110 active:scale-95 transition-all duration-150"
                  >
                    <Sparkles size={16} />
                  </button>
                  <ActionMenu
                    items={[
                      { label: "Edit", icon: <Pencil size={14} />, onClick: () => setEditing(b) },
                      { label: "Delete", icon: <Trash2 size={14} />, onClick: () => deleteBolo(b.id), danger: true },
                    ]}
                    buttonClassName="w-11 h-11 flex items-center justify-center text-[#3F3B30]/50 hover:bg-[#EDE8DC] rounded-full"
                  />
                </div>
              </div>

              {/* Secondhand marketplace search links — plain search URLs
                 today, not live affiliate links yet (see lib/marketplaceLinks.ts) */}
              <div className="flex gap-1.5 mt-2.5 flex-wrap">
                {marketplacesForCategory(b.category).map((m) => (
                  <a
                    key={m.name}
                    href={m.buildUrl(b.name)}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="flex items-center gap-1 text-[10.5px] sm:text-[11px] font-medium rounded-full px-2 sm:px-2.5 py-1 border transition-colors hover:bg-[#F4F1E8]"
                    style={{ borderColor: `${m.color}55`, color: m.color }}
                  >
                    {m.name} <ExternalLink size={9} />
                  </a>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="text-[11px] text-[#3F3B30]/40 mt-4">
        Marketplace links open a live search on that site — not affiliate links yet, just a shortcut to start looking.
      </p>

      {showForm && (
        <BoloFormModal onClose={() => setShowForm(false)} onSubmit={(b) => { addBolo(b); setShowForm(false); }} />
      )}
      {editing && (
        <BoloFormModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={(patch) => {
            updateBolo(editing.id, patch);
            setEditing(null);
          }}
        />
      )}
      {foundItem && (
        <ItemFormModal
          prefill={{
            name: foundItem.name,
            category: foundItem.category,
            brand: "",
            photo: null,
            dateAdded: new Date().toISOString().slice(0, 10),
            notes: foundItem.notes,
          }}
          onClose={() => setFoundItem(null)}
          onSubmit={(item: NewThriftItem) => {
            addItem(item);
            deleteBolo(foundItem.id);
            setFoundItem(null);
          }}
        />
      )}
    </section>
  );
}

function BoloFormModal({
  initial,
  onClose,
  onSubmit,
}: {
  initial?: BoloItem;
  onClose: () => void;
  onSubmit: (b: NewBoloItem) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "Tops");
  const [targetPrice, setTargetPrice] = useState(String(initial?.targetPrice ?? ""));
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const valid = name.trim().length > 0 && targetPrice !== "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    onSubmit({
      name: name.trim(),
      category,
      targetPrice: parseFloat(targetPrice) || 0,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <BottomSheet onClose={onClose}>
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-2 right-2 w-11 h-11 flex items-center justify-center text-[#3F3B30]/40 hover:text-[#3F3B30]"
      >
        <X size={18} />
      </button>
      <h2 className="text-lg font-semibold mb-5 pr-10" style={{ fontFamily: "var(--font-display)" }}>
        {initial ? "Edit hunt item" : "Add to the hunt list"}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wide text-[#3F3B30]/50">Item</span>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Barbour wax jacket" className="modal-input" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wide text-[#3F3B30]/50">Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value as NewBoloItem["category"])} className="modal-input">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wide text-[#3F3B30]/50">Target price (don't pay more than)</span>
          <input type="number" min={0} step="0.01" inputMode="decimal" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} placeholder="40.00" className="modal-input" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wide text-[#3F3B30]/50">Notes</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Optional — size, color, era..." className="modal-input resize-none" />
        </label>
        <button type="submit" disabled={!valid} className="mt-1 min-h-[44px] rounded-full bg-[#333829] text-[#F4F1E8] text-sm font-medium hover:bg-[#333829]/85 transition-colors disabled:opacity-40">
          {initial ? "Save changes" : "Add to hunt list"}
        </button>
      </form>

      <style jsx global>{`
        .modal-input {
          font-family: var(--font-body);
          background: white;
          border: 1px solid rgba(169, 162, 144, 0.5);
          border-radius: 8px;
          padding: 11px 12px;
          font-size: 14px;
          outline: none;
          width: 100%;
        }
        .modal-input:focus {
          border-color: #4f5b3e;
        }
      `}</style>
    </BottomSheet>
  );
}

"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, X, CheckCircle2 } from "lucide-react";
import { useThrift } from "../lib/ThriftContext";
import { CATEGORIES } from "../lib/constants";
import { BoloItem, NewBoloItem, NewThriftItem } from "../lib/types";
import { ItemFormModal } from "./ItemFormModal";

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function Bolo() {
  const { bolo, addBolo, updateBolo, deleteBolo, addItem } = useThrift();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BoloItem | null>(null);
  const [foundItem, setFoundItem] = useState<BoloItem | null>(null);

  return (
    <section className="bg-white border border-[#A9A290]/30 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#3F3B30]/45" style={{ fontFamily: "var(--font-mono)" }}>
          BOLO wishlist
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 text-[12px] font-medium text-[#4F5B3E] border border-[#4F5B3E]/30 rounded-full px-3 py-1.5 hover:bg-[#4F5B3E]/10 transition-colors"
        >
          <Plus size={13} /> Add
        </button>
      </div>

      {bolo.length === 0 ? (
        <p className="text-sm text-[#3F3B30]/55 mt-3">
          No white whales yet. Add a target item and price so you know when to walk away.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2.5">
          {bolo.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between gap-2 border border-[#A9A290]/25 rounded-lg px-3.5 py-2.5"
            >
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
                  onClick={() => setFoundItem(b)}
                  aria-label="Found it"
                  title="Found it!"
                  className="p-1.5 text-[#4F5B3E] hover:bg-[#4F5B3E]/10 rounded-full"
                >
                  <CheckCircle2 size={16} />
                </button>
                <button
                  onClick={() => setEditing(b)}
                  aria-label="Edit"
                  className="p-1.5 text-[#3F3B30]/50 hover:bg-[#EDE8DC] rounded-full"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => deleteBolo(b.id)}
                  aria-label="Delete"
                  className="p-1.5 text-[#A6503B] hover:bg-[#A6503B]/10 rounded-full"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

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
    <div className="fixed inset-0 bg-[#2B2A22]/45 backdrop-blur-[2px] flex items-end sm:items-center justify-center z-50">
      <div className="bg-[#F4F1E8] w-full sm:max-w-sm sm:rounded-lg rounded-t-2xl p-6 relative">
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-[#3F3B30]/40 hover:text-[#3F3B30]">
          <X size={18} />
        </button>
        <h2 className="text-lg font-semibold mb-5" style={{ fontFamily: "var(--font-display)" }}>
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
            <input type="number" min={0} step="0.01" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} placeholder="40.00" className="modal-input" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-wide text-[#3F3B30]/50">Notes</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Optional — size, color, era..." className="modal-input resize-none" />
          </label>
          <button type="submit" disabled={!valid} className="mt-1 rounded-full bg-[#333829] text-[#F4F1E8] py-3 text-sm font-medium hover:bg-[#333829]/85 transition-colors disabled:opacity-40">
            {initial ? "Save changes" : "Add to hunt list"}
          </button>
        </form>
      </div>
    </div>
  );
}

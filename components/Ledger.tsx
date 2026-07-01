"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, Repeat, ImageOff } from "lucide-react";
import { useThrift, savingsFor, cpwFor } from "../lib/ThriftContext";
import { IMPACT_FACTORS } from "../lib/constants";
import { ThriftItem } from "../lib/types";
import { ItemFormModal } from "./ItemFormModal";

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

export function Ledger() {
  const { items, addItem, updateItem, deleteItem, addWear } = useThrift();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<ThriftItem | null>(null);
  const [filter, setFilter] = useState<string>("All");

  const categoriesInUse = ["All", ...new Set(items.map((i) => i.category))];
  const visible = filter === "All" ? items : items.filter((i) => i.category === filter);

  return (
    <section>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#3F3B30]/45" style={{ fontFamily: "var(--font-mono)" }}>
          the ledger
        </h2>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-full bg-[#333829] text-[#F4F1E8] px-4 py-2 text-sm font-medium hover:bg-[#333829]/85 transition-colors"
        >
          <Plus size={15} /> Log a find
        </button>
      </div>

      {categoriesInUse.length > 2 && (
        <div className="flex gap-2 overflow-x-auto mt-4 pb-1 -mx-1 px-1">
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
      )}

      {items.length === 0 ? (
        <div className="mt-4 border border-dashed border-[#A9A290]/50 rounded-lg py-14 text-center">
          <p className="text-[#3F3B30]/60 text-sm">Nothing logged yet. Add your first find to start the ledger.</p>
        </div>
      ) : (
        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...visible].reverse().map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onWear={() => addWear(item.id)}
              onEdit={() => setEditing(item)}
              onDelete={() => deleteItem(item.id)}
            />
          ))}
        </div>
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

function ItemCard({
  item,
  onWear,
  onEdit,
  onDelete,
}: {
  item: ThriftItem;
  onWear: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const impact = IMPACT_FACTORS[item.category];
  const saved = savingsFor(item);
  const cpw = cpwFor(item);

  return (
    <div className="bg-white border border-[#A9A290]/30 rounded-lg overflow-hidden group">
      <div className="aspect-[4/3] bg-[#EDE8DC] relative">
        {item.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.photo} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#A9A290]">
            <ImageOff size={22} />
          </div>
        )}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#F4F1E8]/90 rounded-full px-2 py-1">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: impact.color }} />
          <span className="text-[10px] uppercase tracking-wide text-[#3F3B30]/70" style={{ fontFamily: "var(--font-mono)" }}>
            {item.category}
          </span>
        </div>
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} aria-label="Edit" className="bg-[#F4F1E8]/90 rounded-full p-1.5 hover:bg-white">
            <Pencil size={13} className="text-[#3F3B30]/70" />
          </button>
          <button onClick={onDelete} aria-label="Delete" className="bg-[#F4F1E8]/90 rounded-full p-1.5 hover:bg-white">
            <Trash2 size={13} className="text-[#A6503B]" />
          </button>
        </div>
      </div>

      <div className="p-4">
        {item.brand && (
          <p className="text-[11px] uppercase tracking-wide text-[#3F3B30]/45">{item.brand}</p>
        )}
        <p className="font-medium text-[15px] leading-snug">{item.name}</p>

        <div className="mt-2 flex items-baseline gap-2">
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }} className="text-lg">
            {currency(item.pricePaid)}
          </span>
          <span className="text-[12px] text-[#3F3B30]/40 line-through">{currency(item.retailPrice)}</span>
        </div>
        <p className="text-[12px] text-[#4F5B3E]">saved {currency(saved)}</p>

        <div className="mt-3 pt-3 border-t border-dotted border-[#A9A290]/50 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[#3F3B30]/45">
              {item.wearCount} wear{item.wearCount === 1 ? "" : "s"}
              {cpw !== null && (
                <span>
                  {" "}
                  · <span style={{ fontFamily: "var(--font-mono)" }}>{currency(cpw)}</span>/wear
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onWear}
            className="flex items-center gap-1 text-[12px] font-medium text-[#4F5B3E] border border-[#4F5B3E]/30 rounded-full px-2.5 py-1 hover:bg-[#4F5B3E]/10 transition-colors"
          >
            <Repeat size={12} /> Wear
          </button>
        </div>
      </div>
    </div>
  );
}

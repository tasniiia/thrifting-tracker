"use client";

import { useRef, useState } from "react";
import { X, Camera, Loader2, ShoppingBag, Gift, ChevronDown } from "lucide-react";
import { CATEGORIES, MATERIALS } from "../lib/constants";
import { compressImage } from "../lib/image";
import { ItemStatus, Material, NewThriftItem, ThriftItem } from "../lib/types";
import { BottomSheet, StickyActionBar } from "./BottomSheet";

interface Props {
  onClose: () => void;
  onSubmit: (item: NewThriftItem) => void;
  initial?: ThriftItem | null;
  /** Pre-fills the form, e.g. when converting a BOLO wishlist entry into a real find. */
  prefill?: Partial<NewThriftItem>;
}

export function ItemFormModal({ onClose, onSubmit, initial, prefill }: Props) {
  const isEdit = Boolean(initial);
  const [entryType, setEntryType] = useState<ItemStatus>(initial?.status ?? "active");
  const [name, setName] = useState(initial?.name ?? prefill?.name ?? "");
  const [brand, setBrand] = useState(initial?.brand ?? prefill?.brand ?? "");
  const [category, setCategory] = useState(initial?.category ?? prefill?.category ?? "Other");
  const [material, setMaterial] = useState<Material | "">(initial?.material ?? prefill?.material ?? "");
  const [pricePaid, setPricePaid] = useState(String(initial?.pricePaid ?? ""));
  const [retailPrice, setRetailPrice] = useState(String(initial?.retailPrice ?? prefill?.retailPrice ?? ""));
  const [date, setDate] = useState(initial?.dateAdded ?? new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [photo, setPhoto] = useState<string | null>(initial?.photo ?? null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  // Progressive disclosure: editing an existing item opens with everything
  // visible (there's no "quick capture" moment for an edit), a brand-new
  // entry starts collapsed to the three fields you actually need in the
  // first five seconds of standing in a store aisle.
  const [showDetails, setShowDetails] = useState(isEdit);
  const fileInput = useRef<HTMLInputElement>(null);

  const isDonation = entryType === "donated";
  // Donations don't have a "price paid" — you're giving the item away, not
  // buying it — so "Estimated value" stands in as the always-visible money
  // field for that flow instead.
  const valid = name.trim().length > 0 && (isDonation ? retailPrice !== "" : pricePaid !== "");

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    setPhotoBusy(true);
    try {
      const dataUrl = await compressImage(file);
      setPhoto(dataUrl);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Couldn't process that photo.");
    } finally {
      setPhotoBusy(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    onSubmit({
      name: name.trim(),
      brand: brand.trim(),
      category,
      material: material || undefined,
      pricePaid: isDonation ? 0 : parseFloat(pricePaid) || 0,
      retailPrice: parseFloat(retailPrice) || 0,
      photo,
      dateAdded: date,
      notes: notes.trim() || undefined,
      status: entryType,
    });
  }

  return (
    <BottomSheet onClose={onClose} maxWidth="sm:max-w-md">
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-2 right-2 w-11 h-11 flex items-center justify-center text-[#3F3B30]/40 hover:text-[#3F3B30]"
      >
        <X size={18} />
      </button>
      <h2 className="text-lg font-semibold mb-5 pr-10" style={{ fontFamily: "var(--font-display)" }}>
        {isEdit ? "Edit item" : "Log an item"}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Purchase vs. Donation — decides which fields show and how the
           item is filed once saved (active closet vs. donated archive). */}
        <div className="grid grid-cols-2 gap-2 bg-[#EDE8DC] rounded-full p-1">
          <button
            type="button"
            onClick={() => setEntryType("active")}
            className={`flex items-center justify-center gap-1.5 rounded-full py-2.5 text-[13px] font-medium transition-colors ${
              !isDonation ? "bg-[#333829] text-[#F4F1E8]" : "text-[#3F3B30]/60 hover:text-[#3F3B30]"
            }`}
          >
            <ShoppingBag size={13} /> Purchase
          </button>
          <button
            type="button"
            onClick={() => setEntryType("donated")}
            className={`flex items-center justify-center gap-1.5 rounded-full py-2.5 text-[13px] font-medium transition-colors ${
              isDonation ? "bg-[#333829] text-[#F4F1E8]" : "text-[#3F3B30]/60 hover:text-[#3F3B30]"
            }`}
          >
            <Gift size={13} /> Donation
          </button>
        </div>
        {isDonation && (
          <p className="text-[12px] text-[#4F5B3E] bg-[#4F5B3E]/10 rounded-lg px-3 py-2 -mt-1">
            This logs something you're giving away — it'll count toward your landfill-diversion stats but won't
            show up in your active closet.
          </p>
        )}

        {/* photo — capture="environment" opens the rear camera directly on
           supported mobile browsers instead of a generic file picker */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="w-20 h-20 rounded-lg border border-dashed border-[#A9A290] bg-white flex items-center justify-center overflow-hidden shrink-0"
          >
            {photoBusy ? (
              <Loader2 size={18} className="animate-spin text-[#A9A290]" />
            ) : photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <Camera size={20} className="text-[#A9A290]" />
            )}
          </button>
          <div>
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="text-sm font-medium text-[#4F5B3E] hover:text-[#333829] min-h-[44px] flex items-center"
            >
              {photo ? "Replace photo" : "Snap or add a photo"}
            </button>
            {photo && (
              <button
                type="button"
                onClick={() => setPhoto(null)}
                className="block text-[12px] text-[#A6503B] -mt-1"
              >
                Remove photo
              </button>
            )}
            {photoError && <p className="text-[12px] text-[#A6503B] mt-1">{photoError}</p>}
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhoto}
            className="hidden"
          />
        </div>

        <Field label="Item">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Corduroy jacket"
            className="modal-input"
          />
        </Field>

        <Field label={isDonation ? "Estimated value" : "You paid"}>
          <input
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={isDonation ? retailPrice : pricePaid}
            onChange={(e) => (isDonation ? setRetailPrice(e.target.value) : setPricePaid(e.target.value))}
            placeholder={isDonation ? "48.00" : "8.00"}
            className="modal-input"
          />
        </Field>

        {/* Progressive disclosure — everything below is secondary detail
           that can wait until after the quick in-store capture. */}
        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          className="flex items-center justify-between text-[13px] font-medium text-[#4F5B3E] py-1 min-h-[44px]"
        >
          <span>{showDetails ? "Hide details" : "+ Add details"}</span>
          <ChevronDown size={16} className={`transition-transform ${showDetails ? "rotate-180" : ""}`} />
        </button>

        {showDetails && (
          <div className="flex flex-col gap-4 -mt-1">
            <Field label="Brand">
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Optional"
                className="modal-input"
              />
            </Field>

            <Field label="Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NewThriftItem["category"])}
                className="modal-input"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Material (sharpens the impact estimate)">
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value as Material | "")}
                className="modal-input"
              >
                <option value="">Not sure / mixed</option>
                {MATERIALS.filter((m) => m !== "Mixed/Other").map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </Field>

            {!isDonation && (
              <Field label="Retail price">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={retailPrice}
                  onChange={(e) => setRetailPrice(e.target.value)}
                  placeholder="48.00"
                  className="modal-input"
                />
              </Field>
            )}

            <Field label={isDonation ? "Date donated" : "Date found"}>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="modal-input" />
            </Field>

            <Field label="Notes">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional — fit notes, alterations needed, etc."
                rows={2}
                className="modal-input resize-none"
              />
            </Field>
          </div>
        )}

        <StickyActionBar>
          <button
            type="submit"
            disabled={!valid}
            className="w-full rounded-full bg-[#333829] text-[#F4F1E8] py-3.5 text-sm font-medium hover:bg-[#333829]/85 transition-colors disabled:opacity-40"
          >
            {isEdit ? "Save changes" : isDonation ? "Log donation" : "Add to ledger"}
          </button>
        </StickyActionBar>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-wide text-[#3F3B30]/50">{label}</span>
      {children}
    </label>
  );
}

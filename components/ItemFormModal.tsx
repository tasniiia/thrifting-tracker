"use client";

import { useRef, useState } from "react";
import { X, Camera, Loader2 } from "lucide-react";
import { CATEGORIES } from "../lib/constants";
import { compressImage } from "../lib/image";
import { NewThriftItem, ThriftItem } from "../lib/types";

interface Props {
  onClose: () => void;
  onSubmit: (item: NewThriftItem) => void;
  initial?: ThriftItem | null;
  /** Pre-fills the form, e.g. when converting a BOLO wishlist entry into a real find. */
  prefill?: Partial<NewThriftItem>;
}

export function ItemFormModal({ onClose, onSubmit, initial, prefill }: Props) {
  const isEdit = Boolean(initial);
  const [name, setName] = useState(initial?.name ?? prefill?.name ?? "");
  const [brand, setBrand] = useState(initial?.brand ?? prefill?.brand ?? "");
  const [category, setCategory] = useState(initial?.category ?? prefill?.category ?? "Tops");
  const [pricePaid, setPricePaid] = useState(String(initial?.pricePaid ?? ""));
  const [retailPrice, setRetailPrice] = useState(String(initial?.retailPrice ?? prefill?.retailPrice ?? ""));
  const [date, setDate] = useState(initial?.dateAdded ?? new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [photo, setPhoto] = useState<string | null>(initial?.photo ?? null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const valid = name.trim().length > 0 && pricePaid !== "" && retailPrice !== "";

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
      pricePaid: parseFloat(pricePaid) || 0,
      retailPrice: parseFloat(retailPrice) || 0,
      photo,
      dateAdded: date,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <div className="fixed inset-0 bg-[#2B2A22]/45 backdrop-blur-[2px] flex items-end sm:items-center justify-center z-50">
      <div className="bg-[#F4F1E8] w-full sm:max-w-md sm:rounded-lg rounded-t-2xl sm:rounded-t-lg p-6 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-[#3F3B30]/40 hover:text-[#3F3B30]"
        >
          <X size={18} />
        </button>
        <h2 className="text-lg font-semibold mb-5" style={{ fontFamily: "var(--font-display)" }}>
          {isEdit ? "Edit item" : "Log a find"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* photo */}
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
                className="text-sm font-medium text-[#4F5B3E] hover:text-[#333829]"
              >
                {photo ? "Replace photo" : "Add photo"}
              </button>
              {photo && (
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="block text-[12px] text-[#A6503B] mt-1"
                >
                  Remove photo
                </button>
              )}
              {photoError && <p className="text-[12px] text-[#A6503B] mt-1">{photoError}</p>}
            </div>
            <input ref={fileInput} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Item">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Corduroy jacket"
                className="modal-input"
              />
            </Field>
            <Field label="Brand">
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Optional"
                className="modal-input"
              />
            </Field>
          </div>

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

          <div className="grid grid-cols-2 gap-3">
            <Field label="You paid">
              <input
                type="number"
                min={0}
                step="0.01"
                value={pricePaid}
                onChange={(e) => setPricePaid(e.target.value)}
                placeholder="8.00"
                className="modal-input"
              />
            </Field>
            <Field label="Retail price">
              <input
                type="number"
                min={0}
                step="0.01"
                value={retailPrice}
                onChange={(e) => setRetailPrice(e.target.value)}
                placeholder="48.00"
                className="modal-input"
              />
            </Field>
          </div>

          <Field label="Date found">
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

          <button
            type="submit"
            disabled={!valid}
            className="mt-1 rounded-full bg-[#333829] text-[#F4F1E8] py-3 text-sm font-medium hover:bg-[#333829]/85 transition-colors disabled:opacity-40"
          >
            {isEdit ? "Save changes" : "Add to ledger"}
          </button>
        </form>
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

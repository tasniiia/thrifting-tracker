"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Space_Grotesk, Space_Mono, DM_Sans } from "next/font/google";
import {
  Plus,
  Trash2,
  X,
  Download,
  Share2,
  Droplet,
  Leaf,
  Car,
  ShoppingBag,
  Tag as TagIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Fonts — a stamped, tag-shop feel: bold grotesk for headers,       */
/*  a mono "receipt printer" face for every number, DM Sans for body */
/* ------------------------------------------------------------------ */
const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono" });
const body = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-body" });

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
type Category =
  | "Tops"
  | "Bottoms"
  | "Dresses"
  | "Outerwear"
  | "Shoes"
  | "Accessories"
  | "Home Goods"
  | "Other";

interface ThriftFind {
  id: string;
  itemName: string;
  category: Category;
  thriftPrice: number;
  retailPrice: number;
  date: string; // yyyy-mm-dd
}

/* ------------------------------------------------------------------ */
/*  Environmental impact factors (per item, rough public averages    */
/*  for producing one new garment in that category). These are       */
/*  estimates meant to illustrate scale, not a scientific audit.     */
/* ------------------------------------------------------------------ */
const IMPACT_FACTORS: Record<Category, { waterGal: number; co2Lbs: number; wasteLbs: number; tagColor: string }> = {
  Tops: { waterGal: 715, co2Lbs: 8, wasteLbs: 0.9, tagColor: "#4C6B8A" },
  Bottoms: { waterGal: 1800, co2Lbs: 20, wasteLbs: 1.3, tagColor: "#2C4A3E" },
  Dresses: { waterGal: 1000, co2Lbs: 15, wasteLbs: 1.1, tagColor: "#C1622D" },
  Outerwear: { waterGal: 2100, co2Lbs: 35, wasteLbs: 2.5, tagColor: "#8A4C6B" },
  Shoes: { waterGal: 1600, co2Lbs: 30, wasteLbs: 2.0, tagColor: "#6B5B4C" },
  Accessories: { waterGal: 300, co2Lbs: 5, wasteLbs: 0.4, tagColor: "#B08968" },
  "Home Goods": { waterGal: 500, co2Lbs: 10, wasteLbs: 1.5, tagColor: "#5A7A6E" },
  Other: { waterGal: 700, co2Lbs: 12, wasteLbs: 1.0, tagColor: "#8A8172" },
};

const CATEGORIES = Object.keys(IMPACT_FACTORS) as Category[];

const GALLONS_PER_BATHTUB = 80; // an average full home bathtub
const LBS_CO2_PER_MILE = 0.89; // average passenger car, EPA-style estimate

const STORAGE_KEY = "thrift-tracker:finds";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const uid = () => Math.random().toString(36).slice(2, 10);

function savingsFor(f: ThriftFind) {
  return Math.max(0, f.retailPrice - f.thriftPrice);
}

function impactFor(f: ThriftFind) {
  return IMPACT_FACTORS[f.category];
}

/* ==================================================================== */
/*  PAGE                                                                 */
/* ==================================================================== */
export default function ThriftTrackerPage() {
  const [finds, setFinds] = useState<ThriftFind[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showShare, setShowShare] = useState(false);

  // load / persist
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setFinds(JSON.parse(raw));
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(finds));
  }, [finds, hydrated]);

  const stats = useMemo(() => {
    const totalSpent = finds.reduce((s, f) => s + f.thriftPrice, 0);
    const totalRetail = finds.reduce((s, f) => s + f.retailPrice, 0);
    const totalSaved = finds.reduce((s, f) => s + savingsFor(f), 0);
    const savingsPercent = totalRetail > 0 ? Math.round((totalSaved / totalRetail) * 100) : 0;

    const waterGal = finds.reduce((s, f) => s + impactFor(f).waterGal, 0);
    const co2Lbs = finds.reduce((s, f) => s + impactFor(f).co2Lbs, 0);
    const wasteLbs = finds.reduce((s, f) => s + impactFor(f).wasteLbs, 0);

    const bathtubs = waterGal / GALLONS_PER_BATHTUB;
    const milesDriven = co2Lbs / LBS_CO2_PER_MILE;

    const topFinds = [...finds].sort((a, b) => savingsFor(b) - savingsFor(a)).slice(0, 3);

    return {
      count: finds.length,
      totalSpent,
      totalRetail,
      totalSaved,
      savingsPercent,
      bathtubs,
      wasteLbs,
      milesDriven,
      topFinds,
    };
  }, [finds]);

  function addFind(f: Omit<ThriftFind, "id">) {
    setFinds((prev) => [...prev, { ...f, id: uid() }]);
    setShowAdd(false);
  }

  function removeFind(id: string) {
    setFinds((prev) => prev.filter((f) => f.id !== id));
  }

  return (
    <main
      className={`${display.variable} ${mono.variable} ${body.variable} min-h-screen bg-[#F7F3EA] text-[#1F1B16]`}
      style={{ fontFamily: "var(--font-body)" }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
        {/* ---------- Header ---------- */}
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={22} strokeWidth={2.25} className="text-[#C1622D]" />
            <span
              className="text-lg tracking-tight"
              style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
            >
              Secondhand Ledger
            </span>
          </div>
          <button
            onClick={() => setShowShare(true)}
            disabled={finds.length === 0}
            className="flex items-center gap-1.5 rounded-full border border-[#1F1B16]/15 bg-white px-4 py-2 text-sm font-medium hover:bg-[#1F1B16] hover:text-[#F7F3EA] transition-colors disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#1F1B16]"
          >
            <Share2 size={15} /> My Wrapped
          </button>
        </header>

        {/* ---------- Receipt-style hero ---------- */}
        <section className="relative bg-white border border-[#1F1B16]/10 rounded-sm px-6 sm:px-10 py-8 mb-10 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
          <p
            className="text-[11px] uppercase tracking-[0.2em] text-[#1F1B16]/50 mb-2"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            running total · {stats.count} item{stats.count === 1 ? "" : "s"} thrifted
          </p>
          <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
            <h1
              className="text-5xl sm:text-6xl leading-none"
              style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
            >
              {currency(stats.totalSaved)}
            </h1>
            <p className="text-sm text-[#1F1B16]/60 pb-1.5">
              saved vs. retail
              {stats.savingsPercent > 0 && (
                <span className="text-[#2C4A3E] font-medium"> · {stats.savingsPercent}% off</span>
              )}
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-dashed border-[#1F1B16]/20 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <ReceiptStat label="Spent thrifting" value={currency(stats.totalSpent)} />
            <ReceiptStat label="Retail value" value={currency(stats.totalRetail)} />
            <ReceiptStat label="Avg. saved / item" value={stats.count ? currency(stats.totalSaved / stats.count) : "—"} />
          </div>
        </section>

        {/* ---------- Environmental impact ---------- */}
        <section className="mb-10">
          <SectionEyebrow>estimated impact</SectionEyebrow>
          <div className="grid sm:grid-cols-3 gap-3 mt-3">
            <ImpactCard
              icon={<Droplet size={18} />}
              value={stats.bathtubs.toFixed(1)}
              unit="bathtubs of water"
              detail="kept from new-garment production"
              color="#4C6B8A"
            />
            <ImpactCard
              icon={<Leaf size={18} />}
              value={stats.wasteLbs.toFixed(1)}
              unit="lbs of waste"
              detail="diverted from landfill"
              color="#2C4A3E"
            />
            <ImpactCard
              icon={<Car size={18} />}
              value={Math.round(stats.milesDriven).toLocaleString()}
              unit="miles of driving"
              detail="in avoided CO₂ emissions"
              color="#C1622D"
            />
          </div>
          <p className="text-[11px] text-[#1F1B16]/40 mt-2.5">
            Figures are rough public-average estimates per category, meant to show scale — not an exact audit.
          </p>
        </section>

        {/* ---------- Finds ---------- */}
        <section>
          <div className="flex items-center justify-between">
            <SectionEyebrow>the finds</SectionEyebrow>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 rounded-full bg-[#1F1B16] text-[#F7F3EA] px-4 py-2 text-sm font-medium hover:bg-[#1F1B16]/85 transition-colors"
            >
              <Plus size={15} /> Log a find
            </button>
          </div>

          {finds.length === 0 ? (
            <div className="mt-4 border border-dashed border-[#1F1B16]/20 rounded-sm py-14 text-center">
              <p className="text-[#1F1B16]/60 text-sm">
                Nothing logged yet. Add your first find to start the ledger.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-7">
              {[...finds].reverse().map((f) => (
                <FindTag key={f.id} find={f} onDelete={() => removeFind(f.id)} />
              ))}
            </div>
          )}
        </section>
      </div>

      {showAdd && <AddFindModal onClose={() => setShowAdd(false)} onSubmit={addFind} />}
      {showShare && <ShareModal stats={stats} onClose={() => setShowShare(false)} />}

      <style jsx global>{`
        .thrift-tag {
          -webkit-mask-image: radial-gradient(circle 5px at 14px 22px, transparent 5px, black 5.5px);
          mask-image: radial-gradient(circle 5px at 14px 22px, transparent 5px, black 5.5px);
        }
      `}</style>
    </main>
  );
}

/* ==================================================================== */
/*  Small presentational pieces                                         */
/* ==================================================================== */
function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[11px] uppercase tracking-[0.2em] text-[#1F1B16]/45"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </p>
  );
}

function ReceiptStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-[#1F1B16]/45 mb-0.5">{label}</p>
      <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }} className="text-base">
        {value}
      </p>
    </div>
  );
}

function ImpactCard({
  icon,
  value,
  unit,
  detail,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  unit: string;
  detail: string;
  color: string;
}) {
  return (
    <div className="bg-white border border-[#1F1B16]/10 rounded-sm p-5 flex flex-col gap-2">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${color}1A`, color }}
      >
        {icon}
      </div>
      <p style={{ fontFamily: "var(--font-display)", fontWeight: 700 }} className="text-3xl leading-none">
        {value}
      </p>
      <p className="text-sm font-medium">{unit}</p>
      <p className="text-[12px] text-[#1F1B16]/50">{detail}</p>
    </div>
  );
}

/* A find rendered like a die-cut price tag, hole-punch and all */
function FindTag({ find, onDelete }: { find: ThriftFind; onDelete: () => void }) {
  const impact = impactFor(find);
  const saved = savingsFor(find);
  return (
    <div className="group relative pl-4">
      <div
        className="thrift-tag relative bg-white border border-[#1F1B16]/12 pl-7 pr-4 py-4"
        style={{ borderLeft: `3px solid ${impact.tagColor}` }}
      >
        <button
          onClick={onDelete}
          aria-label={`Remove ${find.itemName}`}
          className="absolute top-2.5 right-2.5 text-[#1F1B16]/25 opacity-0 group-hover:opacity-100 hover:text-[#C1622D] transition-opacity"
        >
          <Trash2 size={14} />
        </button>

        <div className="flex items-center gap-1.5 mb-1.5">
          <TagIcon size={11} style={{ color: impact.tagColor }} />
          <span
            className="text-[10px] uppercase tracking-wider"
            style={{ color: impact.tagColor, fontFamily: "var(--font-mono)" }}
          >
            {find.category}
          </span>
        </div>

        <p className="font-medium text-[15px] leading-snug pr-4">{find.itemName}</p>

        <div className="mt-3 flex items-baseline gap-2">
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }} className="text-lg">
            {currency(find.thriftPrice)}
          </span>
          <span className="text-[12px] text-[#1F1B16]/40 line-through">{currency(find.retailPrice)}</span>
        </div>

        <p className="mt-1 text-[12px] text-[#2C4A3E]">saved {currency(saved)}</p>

        <p className="mt-2 pt-2 border-t border-dotted border-[#1F1B16]/15 text-[11px] text-[#1F1B16]/45">
          {new Date(find.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      </div>
    </div>
  );
}

/* ==================================================================== */
/*  Add find modal                                                       */
/* ==================================================================== */
function AddFindModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (f: Omit<ThriftFind, "id">) => void;
}) {
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState<Category>("Tops");
  const [thriftPrice, setThriftPrice] = useState("");
  const [retailPrice, setRetailPrice] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const valid = itemName.trim().length > 0 && thriftPrice !== "" && retailPrice !== "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    onSubmit({
      itemName: itemName.trim(),
      category,
      thriftPrice: parseFloat(thriftPrice) || 0,
      retailPrice: parseFloat(retailPrice) || 0,
      date,
    });
  }

  return (
    <ModalShell onClose={onClose} title="Log a find">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Item">
          <input
            autoFocus
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Corduroy jacket"
            className="modal-input"
          />
        </Field>

        <Field label="Category">
          <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className="modal-input">
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
              value={thriftPrice}
              onChange={(e) => setThriftPrice(e.target.value)}
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

        <button
          type="submit"
          disabled={!valid}
          className="mt-2 rounded-full bg-[#1F1B16] text-[#F7F3EA] py-3 text-sm font-medium hover:bg-[#1F1B16]/85 transition-colors disabled:opacity-40"
        >
          Add to ledger
        </button>
      </form>
    </ModalShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-wide text-[#1F1B16]/50">{label}</span>
      {children}
    </label>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-[#1F1B16]/40 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
      <div className="bg-[#F7F3EA] rounded-sm border border-[#1F1B16]/10 w-full max-w-sm p-6 relative shadow-xl">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-[#1F1B16]/40 hover:text-[#1F1B16]"
        >
          <X size={18} />
        </button>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700 }} className="text-lg mb-5">
          {title}
        </h2>
        {children}
      </div>
      <style jsx global>{`
        .modal-input {
          font-family: var(--font-body);
          background: white;
          border: 1px solid rgba(31, 27, 22, 0.15);
          border-radius: 4px;
          padding: 9px 12px;
          font-size: 14px;
          outline: none;
        }
        .modal-input:focus {
          border-color: #1f1b16;
        }
      `}</style>
    </div>
  );
}

/* ==================================================================== */
/*  Share modal — draws an Instagram-story sized (1080x1920) "Wrapped"  */
/*  style recap onto a canvas, downloadable as a PNG.                   */
/* ==================================================================== */
function ShareModal({
  stats,
  onClose,
}: {
  stats: {
    count: number;
    totalSaved: number;
    bathtubs: number;
    wasteLbs: number;
    milesDriven: number;
    topFinds: ThriftFind[];
  };
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  async function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // background gradient — denim to forest, thrift-tag rust accent
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#2C4A3E");
    bg.addColorStop(1, "#233B32");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // faint corner glow
    const glow = ctx.createRadialGradient(W * 0.85, H * 0.08, 20, W * 0.85, H * 0.08, 520);
    glow.addColorStop(0, "rgba(193,98,45,0.35)");
    glow.addColorStop(1, "rgba(193,98,45,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // eyebrow
    ctx.fillStyle = "rgba(247,243,234,0.6)";
    ctx.font = "600 30px monospace";
    ctx.textAlign = "left";
    ctx.fillText("MY THRIFT WRAPPED", 80, 160);

    // divider
    ctx.strokeStyle = "rgba(247,243,234,0.25)";
    ctx.setLineDash([2, 14]);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(80, 195);
    ctx.lineTo(W - 80, 195);
    ctx.stroke();
    ctx.setLineDash([]);

    // headline number: total saved
    ctx.fillStyle = "#F7F3EA";
    ctx.font = "700 150px sans-serif";
    ctx.fillText(currency(stats.totalSaved), 76, 400);

    ctx.fillStyle = "rgba(247,243,234,0.7)";
    ctx.font = "400 34px sans-serif";
    ctx.fillText(`saved across ${stats.count} thrifted find${stats.count === 1 ? "" : "s"}`, 80, 460);

    // impact row
    const impactY = 600;
    const impactData: [string, string, string][] = [
      [Math.round(stats.bathtubs * 10) / 10 + "", "bathtubs of water", "#4C6B8A"],
      [Math.round(stats.wasteLbs * 10) / 10 + "", "lbs of waste diverted", "#8FBFA8"],
      [Math.round(stats.milesDriven).toLocaleString(), "miles of driving avoided", "#C1622D"],
    ];

    impactData.forEach(([value, label, color], i) => {
      const y = impactY + i * 150;
      roundRect(ctx, 80, y, W - 160, 120, 20);
      ctx.fillStyle = "rgba(247,243,234,0.06)";
      ctx.fill();

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(150, y + 60, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#F7F3EA";
      ctx.font = "700 56px monospace";
      ctx.fillText(value, 190, y + 76);

      ctx.font = "700 56px monospace";
      const valueWidth = ctx.measureText(value).width;
      ctx.font = "400 30px sans-serif";
      ctx.fillStyle = "rgba(247,243,234,0.75)";
      ctx.fillText(label, 190 + valueWidth + 24, y + 74);
    });

    // top finds
    const topY = impactY + impactData.length * 150 + 70;
    ctx.fillStyle = "rgba(247,243,234,0.6)";
    ctx.font = "600 28px monospace";
    ctx.fillText("TOP FINDS", 80, topY);

    ctx.strokeStyle = "rgba(247,243,234,0.25)";
    ctx.setLineDash([2, 14]);
    ctx.beginPath();
    ctx.moveTo(80, topY + 25);
    ctx.lineTo(W - 80, topY + 25);
    ctx.stroke();
    ctx.setLineDash([]);

    stats.topFinds.forEach((f, i) => {
      const y = topY + 90 + i * 95;
      ctx.fillStyle = "rgba(247,243,234,0.45)";
      ctx.font = "700 40px monospace";
      ctx.fillText(`0${i + 1}`, 80, y);

      ctx.fillStyle = "#F7F3EA";
      ctx.font = "700 38px sans-serif";
      const name = f.itemName.length > 22 ? f.itemName.slice(0, 21) + "…" : f.itemName;
      ctx.fillText(name, 160, y);

      ctx.fillStyle = "#C1622D";
      ctx.font = "700 34px monospace";
      const savedStr = "+" + currency(savingsFor(f));
      const w = ctx.measureText(savedStr).width;
      ctx.fillText(savedStr, W - 80 - w, y);
    });

    // footer signature tag
    const footY = H - 110;
    ctx.fillStyle = "rgba(247,243,234,0.5)";
    ctx.font = "400 26px monospace";
    ctx.fillText("thrifted & tracked with Secondhand Ledger", 80, footY);

    setImgUrl(canvas.toDataURL("image/png"));
  }

  function handleDownload() {
    if (!imgUrl) return;
    const a = document.createElement("a");
    a.href = imgUrl;
    a.download = "thrift-wrapped.png";
    a.click();
  }

  return (
    <div className="fixed inset-0 bg-[#1F1B16]/60 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
      <div className="bg-[#F7F3EA] rounded-sm border border-[#1F1B16]/10 w-full max-w-sm p-5 relative shadow-xl">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-[#1F1B16]/40 hover:text-[#1F1B16]"
        >
          <X size={18} />
        </button>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700 }} className="text-lg mb-4">
          Share your wrapped
        </h2>

        <div className="rounded-sm overflow-hidden border border-[#1F1B16]/10 mx-auto" style={{ maxWidth: 230 }}>
          <canvas ref={canvasRef} className="w-full h-auto block" />
        </div>

        <button
          onClick={handleDownload}
          disabled={!imgUrl}
          className="mt-5 w-full flex items-center justify-center gap-2 rounded-full bg-[#1F1B16] text-[#F7F3EA] py-3 text-sm font-medium hover:bg-[#1F1B16]/85 transition-colors disabled:opacity-40"
        >
          <Download size={15} /> Download for Instagram Story
        </button>
        <p className="text-[11px] text-[#1F1B16]/45 text-center mt-2.5">1080 × 1920 · sized for stories</p>
      </div>
    </div>
  );
}

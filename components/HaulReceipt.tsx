"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X, Download, Receipt } from "lucide-react";
import { useThrift, savingsFor } from "../lib/ThriftContext";
import { IMPACT_FACTORS, GALLONS_PER_BATHTUB, LBS_CO2_PER_MILE } from "../lib/constants";

const currency = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

type Range = "30d" | "all";

/* ==================================================================== */
/*  Canvas drawing helpers — small, self-contained "icon" glyphs and    */
/*  chart primitives. Canvas can't render React icon components, so     */
/*  these are hand-drawn vector shapes that echo the app's Droplet /    */
/*  Cloud / Leaf iconography.                                            */
/* ==================================================================== */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawDroplet(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.bezierCurveTo(cx + r * 0.95, cy - r * 0.1, cx + r * 0.8, cy + r * 0.95, cx, cy + r * 0.95);
  ctx.bezierCurveTo(cx - r * 0.8, cy + r * 0.95, cx - r * 0.95, cy - r * 0.1, cx, cy - r);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawCloud(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx - r * 0.55, cy + r * 0.1, r * 0.5, 0, Math.PI * 2);
  ctx.arc(cx, cy - r * 0.25, r * 0.62, 0, Math.PI * 2);
  ctx.arc(cx + r * 0.55, cy + r * 0.1, r * 0.46, 0, Math.PI * 2);
  ctx.fill();
  roundRect(ctx, cx - r * 0.95, cy, r * 1.9, r * 0.55, r * 0.25);
  ctx.fill();
  ctx.restore();
}

function drawLeaf(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-Math.PI / 4);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.quadraticCurveTo(r, -r * 0.6, r, 0);
  ctx.quadraticCurveTo(r, r * 0.6, 0, r);
  ctx.quadraticCurveTo(-r, r * 0.6, -r, 0);
  ctx.quadraticCurveTo(-r, -r * 0.6, 0, -r);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = Math.max(2, r * 0.08);
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.75);
  ctx.lineTo(0, r * 0.75);
  ctx.stroke();
  ctx.restore();
}

/** A ring/donut chart used to visualize percent-off-retail. */
function drawDonut(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  thickness: number,
  percent: number,
  color: string,
  trackColor: string
) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineWidth = thickness;
  ctx.strokeStyle = trackColor;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  const clamped = Math.max(0, Math.min(100, percent));
  const start = -Math.PI / 2;
  const end = start + Math.PI * 2 * (clamped / 100);
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, start, end);
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = "center";
  ctx.fillStyle = color;
  ctx.font = "700 44px monospace";
  ctx.fillText(`${Math.round(clamped)}%`, cx, cy + 15);
  ctx.font = "400 18px monospace";
  ctx.fillStyle = "#6B6656";
  ctx.fillText("OFF RETAIL", cx, cy + 42);
}

/** Two overlaid horizontal bars comparing what was paid vs. full retail value. */
function drawPaidVsRetailBars(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  maxWidth: number,
  paid: number,
  retail: number
) {
  const barHeight = 34;
  const gap = 16;
  const max = Math.max(paid, retail, 1);

  // retail bar (full width reference, light track)
  roundRect(ctx, x, y, maxWidth, barHeight, barHeight / 2);
  ctx.fillStyle = "#EEEBE1";
  ctx.fill();
  ctx.textAlign = "right";
  ctx.font = "700 22px monospace";
  ctx.fillStyle = "#6B6656";
  ctx.fillText(currency(retail), x + maxWidth - 16, y + barHeight - 9);

  // paid bar, scaled relative to retail
  const paidWidth = Math.max(28, (paid / max) * maxWidth);
  roundRect(ctx, x, y, paidWidth, barHeight, barHeight / 2);
  ctx.fillStyle = "#B5714B";
  ctx.fill();
  ctx.textAlign = "left";
  ctx.font = "700 22px monospace";
  ctx.fillStyle = "#FBF9F3";
  const paidLabel = currency(paid);
  const labelFits = ctx.measureText(paidLabel).width < paidWidth - 24;
  if (labelFits) {
    ctx.fillText(paidLabel, x + 16, y + barHeight - 9);
  } else {
    ctx.fillStyle = "#B5714B";
    ctx.textAlign = "left";
    ctx.fillText(paidLabel, x + paidWidth + 12, y + barHeight - 9);
  }

  ctx.textAlign = "left";
  ctx.font = "400 18px monospace";
  ctx.fillStyle = "#6B6656";
  ctx.fillText("YOU PAID", x, y - 14);
  ctx.textAlign = "right";
  ctx.fillText("FULL RETAIL", x + maxWidth, y - 14);

  return y + barHeight + gap;
}

/** Small deterministic PRNG so the barcode looks random but is stable per render. */
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ==================================================================== */
/*  Trigger + modal                                                      */
/* ==================================================================== */
export function HaulReceiptTrigger() {
  const { items } = useThrift();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={items.length === 0}
        className="flex items-center gap-1.5 rounded-full border border-[#A9A290]/50 bg-white px-4 py-2 text-sm font-medium hover:bg-[#333829] hover:text-[#F4F1E8] hover:border-[#333829] transition-colors disabled:opacity-40"
      >
        <Receipt size={15} /> Haul Flex
      </button>
      {open && <HaulReceiptModal onClose={() => setOpen(false)} />}
    </>
  );
}

function HaulReceiptModal({ onClose }: { onClose: () => void }) {
  const { items } = useThrift();
  const [range, setRange] = useState<Range>("30d");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  const haulItems = useMemo(() => {
    if (range === "all") return items;
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recent = items.filter((i) => new Date(i.dateAdded).getTime() >= cutoff);
    return recent.length > 0 ? recent : items;
  }, [items, range]);

  const totals = useMemo(() => {
    const totalPaid = haulItems.reduce((s, i) => s + i.pricePaid, 0);
    const totalRetail = haulItems.reduce((s, i) => s + i.retailPrice, 0);
    const totalSaved = haulItems.reduce((s, i) => s + savingsFor(i), 0);
    const percentOff = totalRetail > 0 ? (totalSaved / totalRetail) * 100 : 0;
    const waterGal = haulItems.reduce((s, i) => s + IMPACT_FACTORS[i.category].waterGal, 0);
    const co2Lbs = haulItems.reduce((s, i) => s + IMPACT_FACTORS[i.category].co2Lbs, 0);
    const wasteLbs = haulItems.reduce((s, i) => s + IMPACT_FACTORS[i.category].wasteLbs, 0);
    return {
      totalPaid,
      totalRetail,
      totalSaved,
      percentOff,
      bathtubs: waterGal / GALLONS_PER_BATHTUB,
      milesDriven: co2Lbs / LBS_CO2_PER_MILE,
      wasteLbs,
    };
  }, [haulItems]);

  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [haulItems]);

  function zigzagPath(ctx: CanvasRenderingContext2D, y: number, w: number, teeth: number, up: boolean) {
    const step = w / teeth;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let i = 0; i < teeth; i++) {
      const midX = i * step + step / 2;
      const nextX = (i + 1) * step;
      ctx.lineTo(midX, y + (up ? -14 : 14));
      ctx.lineTo(nextX, y);
    }
    ctx.lineTo(w, y);
  }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // outer backdrop (sage) so the torn paper edge reads clearly
    ctx.fillStyle = "#3F4A38";
    ctx.fillRect(0, 0, W, H);

    // paper body with torn top/bottom edges
    const paperTop = 90;
    const paperBottom = H - 90;
    ctx.save();
    ctx.beginPath();
    zigzagPath(ctx, paperTop, W, 22, false);
    ctx.lineTo(W, paperBottom);
    zigzagPath(ctx, paperBottom, W, 22, true);
    ctx.lineTo(0, paperTop);
    ctx.closePath();
    ctx.fillStyle = "#FBF9F3";
    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = 40;
    ctx.fill();
    ctx.restore();

    let y = paperTop + 90;
    ctx.textAlign = "center";
    ctx.fillStyle = "#2B2A22";
    ctx.font = "700 44px monospace";
    ctx.fillText("SECONDHAND LEDGER", W / 2, y);

    y += 40;
    ctx.font = "400 24px monospace";
    ctx.fillStyle = "#6B6656";
    ctx.fillText("haul receipt", W / 2, y);

    y += 50;
    ctx.strokeStyle = "#D8D2C0";
    ctx.setLineDash([6, 8]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(70, y);
    ctx.lineTo(W - 70, y);
    ctx.stroke();
    ctx.setLineDash([]);

    // line items, each with a small category-colored dot
    ctx.textAlign = "left";
    y += 60;
    const maxLines = 6;
    haulItems.slice(0, maxLines).forEach((item) => {
      const dotColor = IMPACT_FACTORS[item.category].color;
      ctx.beginPath();
      ctx.arc(78, y - 9, 7, 0, Math.PI * 2);
      ctx.fillStyle = dotColor;
      ctx.fill();

      ctx.font = "400 30px monospace";
      ctx.fillStyle = "#2B2A22";
      const name = item.name.length > 24 ? item.name.slice(0, 23) + "…" : item.name;
      ctx.fillText(name.toUpperCase(), 98, y);

      ctx.textAlign = "right";
      ctx.fillText(currency(item.pricePaid), W - 70, y);
      ctx.textAlign = "left";
      y += 46;
    });
    if (haulItems.length > maxLines) {
      ctx.font = "400 26px monospace";
      ctx.fillStyle = "#6B6656";
      ctx.fillText(`+ ${haulItems.length - maxLines} more item${haulItems.length - maxLines === 1 ? "" : "s"}`, 98, y);
      y += 46;
    }

    y += 20;
    ctx.strokeStyle = "#D8D2C0";
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.moveTo(70, y);
    ctx.lineTo(W - 70, y);
    ctx.stroke();
    ctx.setLineDash([]);

    // TOTAL SAVED + percent-off donut chart, side by side
    y += 90;
    ctx.font = "700 34px monospace";
    ctx.fillStyle = "#2B2A22";
    ctx.textAlign = "left";
    ctx.fillText("TOTAL SAVED", 70, y - 20);
    ctx.font = "700 72px monospace";
    ctx.fillStyle = "#B5714B";
    ctx.fillText(currency(totals.totalSaved), 70, y + 55);

    drawDonut(ctx, W - 175, y + 10, 88, 16, totals.percentOff, "#B5714B", "#EEEBE1");

    // paid vs. retail bar chart
    y += 150;
    y = drawPaidVsRetailBars(ctx, 70, y, W - 140, totals.totalPaid, totals.totalRetail);

    // environmental wins — icon grid
    y += 50;
    const panelH = 400;
    roundRect(ctx, 70, y, W - 140, panelH, 24);
    ctx.fillStyle = "#EEEBE1";
    ctx.fill();

    ctx.textAlign = "center";
    ctx.font = "700 26px monospace";
    ctx.fillStyle = "#3F4A38";
    ctx.fillText("ENVIRONMENTAL WINS", W / 2, y + 55);

    const colW = (W - 140) / 3;
    const iconCy = y + 150;
    const wins: { draw: (cx: number, cy: number, r: number) => void; value: string; label: string; color: string }[] = [
      {
        draw: (cx, cy, r) => drawDroplet(ctx, cx, cy, r, "#3E6E7A"),
        value: totals.bathtubs.toFixed(1),
        label: "bathtubs of water",
        color: "#3E6E7A",
      },
      {
        draw: (cx, cy, r) => drawCloud(ctx, cx, cy, r, "#6E7F5C"),
        value: Math.round(totals.milesDriven).toLocaleString(),
        label: "miles of driving (CO₂)",
        color: "#6E7F5C",
      },
      {
        draw: (cx, cy, r) => drawLeaf(ctx, cx, cy, r, "#B5714B"),
        value: `${totals.wasteLbs.toFixed(1)}`,
        label: "lbs waste diverted",
        color: "#B5714B",
      },
    ];

    wins.forEach((w, i) => {
      const cx = 70 + colW * i + colW / 2;
      w.draw(cx, iconCy, 42);

      ctx.textAlign = "center";
      ctx.font = "700 46px monospace";
      ctx.fillStyle = "#2B2A22";
      ctx.fillText(w.value, cx, iconCy + 90);

      ctx.font = "400 20px monospace";
      ctx.fillStyle = "#6B6656";
      // wrap label onto two lines if needed
      const words = w.label.split(" ");
      const mid = Math.ceil(words.length / 2);
      const line1 = words.slice(0, mid).join(" ");
      const line2 = words.slice(mid).join(" ");
      ctx.fillText(line1, cx, iconCy + 118);
      if (line2) ctx.fillText(line2, cx, iconCy + 142);
    });

    y += panelH;

    // barcode
    const barcodeY = y + 70;
    let bx = 70;
    const rand = mulberry32(haulItems.length + 7);
    while (bx < W - 70) {
      const bw = 2 + Math.floor(rand() * 6);
      ctx.fillStyle = "#2B2A22";
      ctx.fillRect(bx, barcodeY, bw, 60);
      bx += bw + 4 + Math.floor(rand() * 6);
    }
    ctx.textAlign = "center";
    ctx.font = "400 22px monospace";
    ctx.fillStyle = "#6B6656";
    ctx.fillText("THRIFTED · TRACKED · WORN", W / 2, barcodeY + 100);

    setImgUrl(canvas.toDataURL("image/png"));
  }

  function handleDownload() {
    if (!imgUrl) return;
    const a = document.createElement("a");
    a.href = imgUrl;
    a.download = "haul-flex-receipt.png";
    a.click();
  }

  return (
    <div className="fixed inset-0 bg-[#2B2A22]/55 backdrop-blur-[2px] flex items-end sm:items-center justify-center z-50">
      <div className="bg-[#F4F1E8] w-full sm:max-w-sm sm:rounded-lg rounded-t-2xl p-5 relative">
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-[#3F3B30]/40 hover:text-[#3F3B30]">
          <X size={18} />
        </button>
        <h2 className="text-lg font-semibold mb-1" style={{ fontFamily: "var(--font-display)" }}>
          Haul Flex
        </h2>
        <p className="text-[12px] text-[#3F3B30]/55 mb-4">Your haul, formatted like a receipt — ready to post.</p>

        <div className="flex gap-2 mb-4">
          <RangeButton active={range === "30d"} onClick={() => setRange("30d")}>Last 30 days</RangeButton>
          <RangeButton active={range === "all"} onClick={() => setRange("all")}>All time</RangeButton>
        </div>

        <div className="rounded-lg overflow-hidden mx-auto max-h-[60vh] overflow-y-auto" style={{ maxWidth: 230 }}>
          <canvas ref={canvasRef} className="w-full h-auto block" />
        </div>

        <button
          onClick={handleDownload}
          disabled={!imgUrl}
          className="mt-5 w-full flex items-center justify-center gap-2 rounded-full bg-[#333829] text-[#F4F1E8] py-3 text-sm font-medium hover:bg-[#333829]/85 transition-colors disabled:opacity-40"
        >
          <Download size={15} /> Download for Instagram Story
        </button>
        <p className="text-[11px] text-[#3F3B30]/45 text-center mt-2.5">1080 × 1920 · sized for stories</p>
      </div>
    </div>
  );
}

function RangeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`text-[12px] px-3 py-1.5 rounded-full border transition-colors ${
        active ? "bg-[#333829] text-[#F4F1E8] border-[#333829]" : "bg-white text-[#3F3B30]/70 border-[#A9A290]/40"
      }`}
    >
      {children}
    </button>
  );
}

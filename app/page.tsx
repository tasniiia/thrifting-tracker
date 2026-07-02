"use client";

import { Fraunces, DM_Sans, Space_Mono } from "next/font/google";
import { ShoppingBag, Leaf, AlertTriangle, X } from "lucide-react";
import { ThriftProvider, useThrift } from "../lib/ThriftContext";
import { ToastProvider } from "../lib/Toast";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { Ledger } from "../components/Ledger";
import { Analytics } from "../components/Analytics";
import { SourcingGuide } from "../components/SourcingGuide";
import { CompatibilityCheck } from "../components/CompatibilityCheck";
import { Bolo } from "../components/Bolo";
import { HaulReceiptTrigger } from "../components/HaulReceipt";
import { WelcomeBanner } from "../components/WelcomeBanner";
import { EcoFactStrip } from "../components/EcoFactStrip";

/* Premium-earthy type system, tuned for the "I/O" tech-forward rebrand: a
   warm serif for display, a clean grotesk sans for body copy, and a mono
   face for every number and data point in the ledger. */
const display = Fraunces({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-display" });
const bodyFont = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-body" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono" });

export default function Page() {
  return (
    <div className={`${display.variable} ${bodyFont.variable} ${mono.variable}`}>
      <ErrorBoundary label="Thrift I/O">
        <ToastProvider>
          <ThriftProvider>
            <Dashboard />
          </ThriftProvider>
        </ToastProvider>
      </ErrorBoundary>
    </div>
  );
}

function Dashboard() {
  const { hydrated, storageWarning, dismissWarning, stats } = useThrift();

  return (
    <main
      className="relative min-h-screen bg-[#F4F1E8] text-[#2B2A22] overflow-hidden"
      style={{ fontFamily: "var(--font-body)" }}
    >
      {/* ambient decorative warmth — soft, blurred, sage/clay blobs behind
          the header so the page reads as designed even before any data
          exists. Purely visual, no layout impact (absolute + pointer-events-none). */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-[#4F5B3E]/[0.08] blur-3xl" />
        <div className="absolute -top-16 right-0 w-[360px] h-[360px] rounded-full bg-[#B5714B]/[0.07] blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-14">
        {/* header */}
        <header className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <ShoppingBag size={22} strokeWidth={2.25} className="text-[#B5714B]" />
              <Leaf size={11} className="absolute -right-1.5 -bottom-1.5 text-[#4F5B3E] bg-[#F4F1E8] rounded-full p-[1px]" />
            </div>
            <div>
              <span className="text-lg tracking-tight block leading-none" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
                Thrift <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>I/O</span>
              </span>
              <span className="text-[11px] text-[#3F3B30]/45 block mt-1">Your closet, your savings, your footprint</span>
            </div>
          </div>
          <ErrorBoundary label="Haul Flex">
            <HaulReceiptTrigger />
          </ErrorBoundary>
        </header>

        <div className="mt-6">
          <EcoFactStrip />
        </div>

        {storageWarning && (
          <div className="flex items-start gap-2.5 bg-[#F3E4DC] border border-[#B5714B]/30 text-[#7A4A2E] rounded-lg px-4 py-3 mb-6 text-sm">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <p className="flex-1">{storageWarning}</p>
            <button onClick={dismissWarning} aria-label="Dismiss">
              <X size={15} />
            </button>
          </div>
        )}

        {!hydrated ? (
          <SkeletonState />
        ) : (
          <>
            {stats.count === 0 && <WelcomeBanner />}

            <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
              {/* main column */}
              <div className="flex flex-col gap-8 order-1">
                <ErrorBoundary label="Analytics">
                  <Analytics />
                </ErrorBoundary>
                <ErrorBoundary label="Ledger">
                  <Ledger />
                </ErrorBoundary>
              </div>

              {/* side column on desktop, stacks below on mobile — the
                 "BOLO/Explore" surface: sourcing, compatibility, hunt list */}
              <div className="flex flex-col gap-6 order-2">
                <ErrorBoundary label="Sourcing guide">
                  <SourcingGuide />
                </ErrorBoundary>
                <ErrorBoundary label="Compatibility check">
                  <CompatibilityCheck />
                </ErrorBoundary>
                <ErrorBoundary label="BOLO wishlist">
                  <Bolo />
                </ErrorBoundary>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function SkeletonState() {
  return (
    <div className="flex flex-col gap-6 animate-pulse mt-6">
      <div className="h-40 bg-[#EDE8DC] rounded-lg" />
      <div className="h-64 bg-[#EDE8DC] rounded-lg" />
    </div>
  );
}

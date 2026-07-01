"use client";

import { Fraunces, DM_Sans, Space_Mono } from "next/font/google";
import { ShoppingBag, AlertTriangle, X } from "lucide-react";
import { ThriftProvider, useThrift } from "../lib/ThriftContext";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { Ledger } from "../components/Ledger";
import { Analytics } from "../components/Analytics";
import { SourcingGuide } from "../components/SourcingGuide";
import { Bolo } from "../components/Bolo";
import { HaulReceiptTrigger } from "../components/HaulReceipt";

/* Premium-earthy type system: a warm serif for display, a clean grotesk
   sans for body copy, and a mono face for every number in the ledger. */
const display = Fraunces({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-display" });
const bodyFont = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-body" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono" });

export default function Page() {
  return (
    <div className={`${display.variable} ${bodyFont.variable} ${mono.variable}`}>
      <ErrorBoundary label="ThriftTracker">
        <ThriftProvider>
          <Dashboard />
        </ThriftProvider>
      </ErrorBoundary>
    </div>
  );
}

function Dashboard() {
  const { hydrated, storageWarning, dismissWarning } = useThrift();

  return (
    <main className="min-h-screen bg-[#F4F1E8] text-[#2B2A22]" style={{ fontFamily: "var(--font-body)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-14">
        {/* header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={22} strokeWidth={2.25} className="text-[#B5714B]" />
            <span className="text-lg tracking-tight" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
              Secondhand Ledger
            </span>
          </div>
          <ErrorBoundary label="Haul Flex">
            <HaulReceiptTrigger />
          </ErrorBoundary>
        </header>

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

            {/* side column on desktop, stacks below on mobile */}
            <div className="flex flex-col gap-6 order-2">
              <ErrorBoundary label="Sourcing guide">
                <SourcingGuide />
              </ErrorBoundary>
              <ErrorBoundary label="BOLO wishlist">
                <Bolo />
              </ErrorBoundary>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function SkeletonState() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-40 bg-[#EDE8DC] rounded-lg" />
      <div className="h-64 bg-[#EDE8DC] rounded-lg" />
    </div>
  );
}

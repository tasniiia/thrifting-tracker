"use client";

import React, { useState, useEffect, ErrorInfo, ReactNode } from 'react';
import { Trash2, Share2, Leaf, Droplets, Info, Plus } from 'lucide-react';

// --- Error Boundary to prevent white screen ---
class ErrorBoundary extends React.Component<{children: ReactNode}, {hasError: boolean}> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error(error, errorInfo); }
  render() { 
    if (this.state.hasError) return <div className="p-10 text-center">Something went wrong. Please refresh.</div>;
    return this.props.children;
  }
}

interface ThriftItem {
  id: string;
  name: string;
  category: string;
  pricePaid: number;
  retailPrice: number;
  wears: number;
}

export default function App() {
  const [items, setItems] = useState<ThriftItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('thriftedItems');
      if (saved) setItems(JSON.parse(saved));
    } catch (e) {
      console.error("Storage error", e);
    }
    setIsLoaded(true);
  }, []);

  if (!isLoaded) return <div className="p-10 text-center">Loading...</div>;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-stone-50 p-4 md:p-8">
        <header className="max-w-4xl mx-auto flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">ThriftTracker</h1>
        </header>

        <main className="max-w-4xl mx-auto">
          <div className="bg-emerald-900 text-white p-6 rounded-2xl mb-8">
            <h2 className="font-bold text-lg mb-2">Impact Summary</h2>
            <p className="text-emerald-200 text-sm">
              You've saved {items.length * 500} gallons of water by choosing second-hand.
            </p>
          </div>

          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-xl border flex justify-between items-center">
                <span className="font-medium">{item.name}</span>
                <span className="text-sm font-bold text-emerald-600">${item.pricePaid}</span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
"use client";

import React, { useState, useEffect, ReactNode } from 'react';
import { 
  Leaf, Droplets, Trash2, Edit2, Share2, Plus, Info, 
  Store, Target, Tag, X, MapPin, Zap, TrendingUp, Search, Layers 
} from 'lucide-react';

// --- Error Boundary for Vercel Stability ---
class ErrorBoundary extends React.Component<{children: ReactNode}, {hasError: boolean}> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { 
    if (this.state.hasError) return <div className="p-10 text-center">Something went wrong. Refreshing...</div>;
    return this.props.children;
  }
}

// --- Types & Constants ---
interface ThriftItem {
  id: string;
  name: string;
  brand: string;
  category: 'Tops' | 'Bottoms' | 'Dresses' | 'Outerwear' | 'Footwear' | 'Home';
  pricePaid: number;
  retailPrice: number;
  wears: number;
  image: string | null;
}

const IMPACT_CALCS = {
  waterPerItem: { Tops: 500, Bottoms: 1800, Dresses: 1200, Outerwear: 1000, Footwear: 500, Home: 300 },
  wastePerItem: { Tops: 0.5, Bottoms: 1.0, Dresses: 1.2, Outerwear: 2.0, Footwear: 1.0, Home: 2.0 },
  co2PerItem: { Tops: 2, Bottoms: 4, Dresses: 3.5, Outerwear: 5, Footwear: 3, Home: 2 }
};

const STORES = [
  { name: '2nd Street (Portland)', vibe: 'High-end Curated', match: ['Outerwear', 'Footwear'], desc: 'Perfect for Gorpcore & High-end vintage.' },
  { name: 'Goodwill Outlet (Bins)', vibe: 'The Treasure Hunt', match: ['Tops', 'Bottoms', 'Home'], desc: 'Pay-by-the-pound. Best for high-volume basics.' },
  { name: 'Red Light Exchange', vibe: 'Trendy/Vintage', match: ['Dresses', 'Tops'], desc: 'Curated 90s/Y2K vibes. Great for statement tops.' },
  { name: 'House of Vintage', vibe: 'Collector Paradise', match: ['Outerwear', 'Bottoms'], desc: 'Massive selection of historical fashion.' }
];

export default function ThriftTracker() {
  const [items, setItems] = useState<ThriftItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('thriftedItems');
    if (saved) try { setItems(JSON.parse(saved)); } catch (e) { setItems([]); }
    setIsLoaded(true);
  }, []);

  const totals = items.reduce((acc, i) => {
    const cat = i.category;
    acc.water += (IMPACT_CALCS.waterPerItem[cat] || 500);
    acc.co2 += (IMPACT_CALCS.co2PerItem[cat] || 2);
    acc.money += (i.retailPrice - i.pricePaid);
    return acc;
  }, { water: 0, co2: 0, money: 0 });

  const topCategory = items.length > 0 ? items.reduce((a, b) => 
    items.filter(x => x.category === a).length >= items.filter(x => x.category === b.category).length ? a : b.category, items[0].category) : 'Tops';

  if (!isLoaded) return <div className="p-10 text-center font-bold">Loading your closet...</div>;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-stone-50 text-stone-900 pb-20">
        <header className="bg-white border-b sticky top-0 z-30 px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-black">ThriftTracker</h1>
          <button onClick={() => setIsSharing(true)} className="bg-stone-900 text-white p-2 rounded-full"><Share2 size={18}/></button>
        </header>

        <main className="max-w-6xl mx-auto p-4 md:p-8 grid md:grid-cols-4 gap-8">
          {/* Desktop Stats Sidebar */}
          <div className="hidden md:block col-span-1 space-y-6">
            <div className="bg-emerald-900 text-emerald-50 p-6 rounded-2xl">
              <h2 className="text-xs font-bold opacity-70 uppercase mb-4">Total Impact</h2>
              <div className="space-y-4">
                <div><p className="text-3xl font-black">${totals.money.toFixed(0)}</p><p className="text-xs opacity-60">Money Saved</p></div>
                <div><p className="text-3xl font-black">{Math.round(totals.water / 40)}</p><p className="text-xs opacity-60">Bathtubs of Water</p></div>
                <div><p className="text-3xl font-black">{Math.round(totals.co2 / 0.4)}</p><p className="text-xs opacity-60">Miles Driven Avoided</p></div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="md:col-span-3">
            <div className="flex gap-6 border-b mb-8 overflow-x-auto">
              {['dashboard', 'explore', 'wishlist'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 font-bold capitalize ${activeTab === tab ? 'text-emerald-700 border-b-2 border-emerald-700' : 'text-stone-400'}`}>{tab}</button>
              ))}
            </div>

            {activeTab === 'dashboard' && (
              <div className="space-y-4">
                {items.length === 0 ? <p className="italic text-stone-400">Your ledger is empty.</p> : 
                items.map(i => (
                  <div key={i.id} className="bg-white p-4 rounded-xl border flex justify-between items-center shadow-sm hover:border-emerald-500 transition-all">
                    <div><p className="font-bold">{i.name}</p><p className="text-xs text-stone-500">{i.category} • CPW: ${(i.pricePaid / (i.wears || 1)).toFixed(2)}</p></div>
                    <button onClick={() => {
                        const next = items.map(x => x.id === i.id ? {...x, wears: x.wears + 1} : x);
                        setItems(next); localStorage.setItem('thriftedItems', JSON.stringify(next));
                    }} className="bg-stone-100 px-4 py-2 rounded-full text-xs font-bold hover:bg-stone-200">+ Wear</button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'explore' && (
              <div className="space-y-4">
                <h3 className="font-bold mb-4">AI Sourcing Guide (Personalized for {topCategory})</h3>
                {STORES.filter(s => s.match.includes(topCategory)).map(s => (
                  <div key={s.name} className="bg-white p-6 rounded-2xl border flex gap-4">
                    <Store className="text-emerald-600 mt-1" />
                    <div><p className="font-bold">{s.name}</p><p className="text-xs text-emerald-800 bg-emerald-50 inline-block px-2 py-1 rounded">{s.vibe}</p><p className="text-sm mt-2 text-stone-600">{s.desc}</p></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
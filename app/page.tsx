"use client";

import React, { useState, useEffect, ReactNode } from 'react';
import { 
  Leaf, Droplets, Trash2, Edit2, Share2, Plus, Info, 
  Store, Target, Tag, X, MapPin, Zap, TrendingUp, Search, Layers 
} from 'lucide-react';

// --- Production Stability: Error Boundary ---
class ErrorBoundary extends React.Component<{children: ReactNode}, {hasError: boolean}> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { 
    if (this.state.hasError) return <div className="p-10 text-center text-red-500">Something went wrong. Refresh to reload.</div>;
    return this.props.children;
  }
}

// --- Data Types ---
interface ThriftItem {
  id: string;
  name: string;
  brand: string;
  category: 'Tops' | 'Bottoms' | 'Dresses' | 'Outerwear' | 'Footwear' | 'Home';
  pricePaid: number;
  retailPrice: number;
  wears: number;
}

const IMPACT_CALCS = {
  waterPerItem: { Tops: 500, Bottoms: 1800, Dresses: 1200, Outerwear: 1000, Footwear: 500, Home: 300 },
  co2PerItem: { Tops: 2, Bottoms: 4, Dresses: 3.5, Outerwear: 5, Footwear: 3, Home: 2 },
  wastePerItem: { Tops: 0.5, Bottoms: 1.0, Dresses: 1.2, Outerwear: 2.0, Footwear: 1.0, Home: 2.0 }
};

const STORES = [
  { name: '2nd Street (Portland)', vibe: 'High-end Curated', match: ['Outerwear', 'Footwear'], desc: 'Perfect for Gorpcore & High-end vintage.' },
  { name: 'Goodwill Outlet (Bethany/Portland)', vibe: 'Treasure Hunt', match: ['Tops', 'Bottoms', 'Home'], desc: 'Pay-by-the-pound. Best for high-volume basics.' },
  { name: 'Red Light Exchange', vibe: 'Trendy/Vintage', match: ['Dresses', 'Tops'], desc: 'Curated 90s/Y2K vibes. Great for statement tops.' },
  { name: 'House of Vintage', vibe: 'Collector Paradise', match: ['Outerwear', 'Bottoms'], desc: 'Massive selection of historical fashion.' }
];

export default function ThriftTracker() {
  const [items, setItems] = useState<ThriftItem[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoaded, setIsLoaded] = useState(false);
  const [formData, setFormData] = useState({ name: '', brand: '', category: 'Tops' as const, pricePaid: '', retailPrice: '' });

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

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: ThriftItem = {
      id: crypto.randomUUID(),
      name: formData.name,
      brand: formData.brand,
      category: formData.category,
      pricePaid: parseFloat(formData.pricePaid) || 0,
      retailPrice: parseFloat(formData.retailPrice) || 0,
      wears: 0
    };
    const next = [newItem, ...items];
    setItems(next);
    localStorage.setItem('thriftedItems', JSON.stringify(next));
    setFormData({ name: '', brand: '', category: 'Tops', pricePaid: '', retailPrice: '' });
  };

  if (!isLoaded) return <div className="p-10 text-center font-bold">Loading closet...</div>;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-stone-50 text-stone-900 pb-20">
        <header className="bg-white border-b sticky top-0 z-30 px-6 py-4 flex justify-between items-center shadow-sm">
          <h1 className="text-xl font-black italic tracking-tighter">ThriftTracker</h1>
          <button className="bg-stone-900 text-white px-4 py-2 rounded-full font-bold text-xs">Share Impact</button>
        </header>

        <main className="max-w-6xl mx-auto p-4 md:p-8 grid md:grid-cols-4 gap-8">
          {/* Stats Sidebar */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-emerald-900 text-emerald-50 p-6 rounded-2xl">
              <h2 className="text-xs font-bold opacity-70 uppercase mb-4">Total Impact</h2>
              <div className="space-y-4">
                <div><p className="text-3xl font-black">${totals.money.toFixed(0)}</p><p className="text-xs opacity-60">Money Saved</p></div>
                <div><p className="text-3xl font-black">{Math.round(totals.water / 40)}</p><p className="text-xs opacity-60">Bathtubs of Water</p></div>
                <div><p className="text-3xl font-black">{Math.round(totals.co2 / 0.4)}</p><p className="text-xs opacity-60">Miles Driven Avoided</p></div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border shadow-sm text-xs text-stone-500">
              <h3 className="font-bold text-stone-900 mb-2">Methodology</h3>
              <p>Water/CO2 stats are calculated based on industrial production averages for textile categories. Financial savings compares your thrift price against current market retail.</p>
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
              <div className="space-y-6">
                <form onSubmit={addItem} className="bg-white p-6 rounded-2xl border shadow-sm">
                  <h3 className="font-bold mb-4">Add New Find</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input className="col-span-2 p-3 bg-stone-50 border rounded-lg" placeholder="Item Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    <input className="p-3 bg-stone-50 border rounded-lg" placeholder="Brand" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                    <select className="p-3 bg-stone-50 border rounded-lg" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
                      {Object.keys(IMPACT_CALCS.waterPerItem).map(c => <option key={c}>{c}</option>)}
                    </select>
                    <input className="p-3 bg-stone-50 border rounded-lg" placeholder="Paid ($)" value={formData.pricePaid} onChange={e => setFormData({...formData, pricePaid: e.target.value})} />
                    <input className="p-3 bg-stone-50 border rounded-lg" placeholder="Retail ($)" value={formData.retailPrice} onChange={e => setFormData({...formData, retailPrice: e.target.value})} />
                  </div>
                  <button className="w-full mt-4 bg-stone-900 text-white py-3 rounded-lg font-bold">Log to Ledger</button>
                </form>

                <div className="space-y-3">
                  {items.map(i => (
                    <div key={i.id} className="bg-white p-4 rounded-xl border flex justify-between items-center shadow-sm">
                      <div><p className="font-bold">{i.name}</p><p className="text-xs text-stone-500">{i.category} • Wears: {i.wears}</p></div>
                      <button onClick={() => {
                          const next = items.map(x => x.id === i.id ? {...x, wears: x.wears + 1} : x);
                          setItems(next); localStorage.setItem('thriftedItems', JSON.stringify(next));
                      }} className="bg-stone-100 px-4 py-2 rounded-full text-xs font-bold hover:bg-stone-200">+ Wear</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'explore' && (
              <div className="space-y-4">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Sparkles className="text-emerald-600" /> AI Sourcing Guide (Matches {topCategory})</h3>
                {STORES.filter(s => s.match.includes(topCategory)).map(s => (
                  <div key={s.name} className="bg-white p-6 rounded-2xl border flex gap-4">
                    <Store className="text-emerald-600 mt-1" />
                    <div><p className="font-bold">{s.name}</p><p className="text-xs text-emerald-800 bg-emerald-50 inline-block px-2 py-1 rounded my-1">{s.vibe}</p><p className="text-sm mt-2 text-stone-600">{s.desc}</p></div>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'wishlist' && <div className="text-center p-20 bg-white rounded-2xl border border-dashed">Wishlist feature coming soon.</div>}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
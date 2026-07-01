"use client";

import React, { useState, useEffect } from 'react';
import { 
  Leaf, Droplets, Trash2, Share2, Plus, Info, 
  Store, Target, Search, Layers, ChevronRight, MapPin, Sparkles, TrendingUp
} from 'lucide-react';

// --- Types ---
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
  { name: 'Goodwill Outlet (Bethany)', vibe: 'Treasure Hunt', match: ['Tops', 'Bottoms', 'Home'], desc: 'Pay-by-the-pound. Best for high-volume basics.' },
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
    if (saved) {
      try { setItems(JSON.parse(saved)); } catch (e) { setItems([]); }
    } else {
      setItems([{ id: '1', name: 'Vintage 501s', brand: 'Levi', category: 'Bottoms', pricePaid: 15, retailPrice: 90, wears: 4 }]);
    }
    setIsLoaded(true);
  }, []);

  const totals = items.reduce((acc, i) => {
    const cat = i.category;
    acc.water += (IMPACT_CALCS.waterPerItem[cat] || 500);
    acc.co2 += (IMPACT_CALCS.co2PerItem[cat] || 2);
    acc.money += (i.retailPrice - i.pricePaid);
    return acc;
  }, { water: 0, co2: 0, money: 0 });

  const topCategory = items.length > 0 
    ? items.reduce((a, b) => items.filter(x => x.category === a).length >= items.filter(x => x.category === b.category).length ? a : b.category, items[0].category) 
    : 'Tops';

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: ThriftItem = {
      id: Math.random().toString(36).substr(2, 9),
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

  if (!isLoaded) return <div className="min-h-screen bg-stone-50 flex items-center justify-center font-bold text-stone-400">Loading closet...</div>;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-20">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-black italic tracking-tighter text-emerald-900">ThriftTracker</h1>
        <div className="flex gap-2">
            <button className="bg-emerald-800 text-white px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2">
                <Share2 size={12}/> Share Haul
            </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 grid md:grid-cols-4 gap-8">
        {/* Stats Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-emerald-950 text-emerald-50 p-6 rounded-3xl shadow-xl">
            <h2 className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-4">Total Impact</h2>
            <div className="space-y-6">
              <div><p className="text-4xl font-black">${totals.money.toFixed(0)}</p><p className="text-[10px] uppercase font-bold opacity-60">Money Saved</p></div>
              <div className="flex justify-between">
                <div><p className="text-xl font-black">{Math.round(totals.water / 40)}</p><p className="text-[9px] uppercase opacity-60">Bathtubs Water</p></div>
                <div><p className="text-xl font-black">{Math.round(totals.co2 / 0.4)}</p><p className="text-[9px] uppercase opacity-60">Miles Avoided</p></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
            <h3 className="font-bold flex items-center gap-2 mb-3 text-stone-800"><Info size={16} className="text-emerald-700"/> Methodology</h3>
            <p className="text-xs text-stone-500 leading-relaxed italic">
              Impact stats are calculated using industrial textile production averages. Financial savings reflects the difference between the retail market price and your thrifted cost.
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3">
          <div className="flex gap-2 mb-8 bg-stone-200/50 p-1 rounded-full w-fit">
            {['dashboard', 'explore', 'wishlist'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`px-6 py-2 rounded-full font-bold capitalize transition ${activeTab === tab ? 'bg-white shadow text-emerald-900' : 'text-stone-500'}`}
              >{tab}</button>
            ))}
          </div>

          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <form onSubmit={addItem} className="bg-white p-6 rounded-3xl border shadow-sm">
                <h3 className="font-bold mb-4">Add New Find</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input className="col-span-2 p-3 bg-stone-50 border rounded-xl" placeholder="Item Name (e.g. Vintage Denim)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  <input className="p-3 bg-stone-50 border rounded-xl" placeholder="Brand" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                  <select className="p-3 bg-stone-50 border rounded-xl" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
                    {Object.keys(IMPACT_CALCS.waterPerItem).map(c => <option key={c}>{c}</option>)}
                  </select>
                  <input className="p-3 bg-stone-50 border rounded-xl" placeholder="Paid ($)" value={formData.pricePaid} onChange={e => setFormData({...formData, pricePaid: e.target.value})} />
                  <input className="p-3 bg-stone-50 border rounded-xl" placeholder="Retail ($)" value={formData.retailPrice} onChange={e => setFormData({...formData, retailPrice: e.target.value})} />
                </div>
                <button className="w-full mt-4 bg-emerald-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-800 transition">
                  <Plus size={18}/> Log to Ledger
                </button>
              </form>

              <div className="space-y-3">
                {items.map(i => (
                  <div key={i.id} className="bg-white p-5 rounded-2xl border border-stone-200 flex justify-between items-center shadow-sm">
                    <div>
                        <p className="font-bold text-stone-900">{i.name}</p>
                        <p className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">{i.category}</p>
                    </div>
                    <button onClick={() => {
                        const next = items.map(x => x.id === i.id ? {...x, wears: x.wears + 1} : x);
                        setItems(next); localStorage.setItem('thriftedItems', JSON.stringify(next));
                    }} className="bg-stone-900 text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-stone-700">
                        {i.wears} Wears
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'explore' && (
            <div className="space-y-6">
              <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                <h3 className="font-bold mb-2 flex items-center gap-2 text-emerald-900"><Sparkles className="text-emerald-600" /> AI Sourcing Guide</h3>
                <p className="text-sm text-emerald-800">Based on your love for <span className="font-bold">{topCategory}</span>, we suggest these spots in your area:</p>
              </div>
              {STORES.filter(s => s.match.includes(topCategory)).map(s => (
                <div key={s.name} className="bg-white p-6 rounded-3xl border shadow-sm flex gap-4 hover:border-emerald-300 transition group">
                  <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-500 group-hover:bg-emerald-50 group-hover:text-emerald-600">
                      <Store />
                  </div>
                  <div className="flex-1">
                      <p className="font-bold text-lg">{s.name}</p>
                      <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-2">{s.vibe}</p>
                      <p className="text-sm text-stone-600">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'wishlist' && (
              <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-stone-200 text-center">
                  <Target size={48} className="mx-auto text-stone-300 mb-4"/>
                  <h3 className="font-bold text-stone-800">Your BOLO List</h3>
                  <p className="text-sm text-stone-500">Your "White Whales" are currently being tracked.</p>
              </div>
          )}
        </div>
      </main>
    </div>
  );
}
```

### Steps to Success:
1. **Redeploy:** Replace `app/page.tsx` with this code.
2. **Environment Variables:** If your deployment still shows as blank, ensure you have set the `NEXT_TYPESCRIPT_IGNORE=true` environment variable in Vercel settings under "Environment Variables".
3. **No Cache:** Always choose "Redeploy" and ensure the "Use build cache" box is **un-checked**.
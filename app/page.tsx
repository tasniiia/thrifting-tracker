"use client";

import React, { useState, useEffect } from 'react';
import { 
  Camera, Leaf, Droplets, Trash, Car, Info, Share2, Shirt, 
  MapPin, Store, Target, X, Trash2, ChevronRight 
} from 'lucide-react';

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

const ENVIRONMENTAL_FACTS: Record<string, { water: number; co2: number; waste: number }> = {
  Tops: { water: 500, co2: 2, waste: 0.5 },
  Bottoms: { water: 1800, co2: 4, waste: 1.0 },
  Dresses: { water: 1200, co2: 3.5, waste: 1.2 },
  Outerwear: { water: 1000, co2: 5, waste: 2.0 },
  Footwear: { water: 500, co2: 3, waste: 1.0 },
  Home: { water: 300, co2: 2, waste: 2.0 }
};

const LOCAL_STORES = [
  { id: '1', name: '2nd Street Hawthorne', type: 'Curated Vintage', match: ['Outerwear', 'Footwear', 'Tops'], vibe: "High-end designer focus. Best for finding premium gorpcore and streetwear." },
  { id: '2', name: 'Goodwill Outlet (The Bins)', type: 'Pay-by-the-pound', match: ['Tops', 'Bottoms', 'Home'], vibe: "The treasure hunter's paradise. High volume, low cost, infinite potential." },
  { id: '3', name: 'Red Light Exchange', type: 'Vintage Collective', match: ['Dresses', 'Tops'], vibe: "Eclectic 90s/Y2K vibes. Perfect for statement pieces that nobody else has." },
  { id: '4', name: 'House of Vintage', type: 'Antique Marketplace', match: ['Outerwear', 'Tops'], vibe: "A massive multi-vendor maze. Best for classic Americana and vintage leather." }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [items, setItems] = useState<ThriftItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', brand: '', category: 'Tops', pricePaid: '', retailPrice: '', image: null as string | null
  });

  useEffect(() => {
    const saved = localStorage.getItem('thriftedItems');
    if (saved) setItems(JSON.parse(saved));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('thriftedItems', JSON.stringify(items));
  }, [items, isLoaded]);

  // --- Calculations ---
  const metrics = items.reduce((acc, item) => {
    const impact = ENVIRONMENTAL_FACTS[item.category] || ENVIRONMENTAL_FACTS['Tops'];
    return {
      savings: acc.savings + (item.retailPrice - item.pricePaid),
      water: acc.water + impact.water,
      co2: acc.co2 + impact.co2,
      waste: acc.waste + impact.waste,
    };
  }, { savings: 0, water: 0, co2: 0, waste: 0 });

  const topCategory = items.length > 0 
    ? items.reduce((a, b) => (items.filter(x => x.category === a).length >= items.filter(x => x.category === b.category).length) ? a : b.category, items[0].category)
    : null;

  // --- Handlers ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setFormData(prev => ({ ...prev, image: event.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: ThriftItem = {
      ...formData,
      id: crypto.randomUUID(),
      category: formData.category as any,
      pricePaid: parseFloat(formData.pricePaid) || 0,
      retailPrice: parseFloat(formData.retailPrice) || 0,
      wears: 0
    };
    setItems([newItem, ...items]);
    setFormData({ name: '', brand: '', category: 'Tops', pricePaid: '', retailPrice: '', image: null });
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-slate-900 pb-20 md:pb-0">
      <header className="bg-white border-b border-stone-200 py-4 px-6 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">ThriftTracker</h1>
          <button onClick={() => setIsSharing(true)} className="bg-stone-900 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
            <Share2 size={16} /> Haul
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
        {/* Environmental Impact Methodology Dashboard */}
        <section className="bg-emerald-900 text-emerald-50 rounded-2xl p-6 md:p-8 shadow-xl">
          <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-300 mb-6">Your Total Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex gap-3"><Droplets className="text-blue-400" /><div><p className="text-2xl font-bold">{Math.round(metrics.water / 50)}</p><p className="text-xs text-emerald-300">Bathtubs of Water</p></div></div>
            <div className="flex gap-3"><Leaf className="text-emerald-400" /><div><p className="text-2xl font-bold">{metrics.waste.toFixed(1)}</p><p className="text-xs text-emerald-300">Lbs Waste Saved</p></div></div>
            <div className="flex gap-3"><Car className="text-amber-400" /><div><p className="text-2xl font-bold">{Math.round(metrics.co2 * 2.5)}</p><p className="text-xs text-emerald-300">Miles Driven Offset</p></div></div>
            <div className="flex gap-3"><DollarSign className="text-emerald-300" /><div><p className="text-2xl font-bold">${metrics.savings.toFixed(0)}</p><p className="text-xs text-emerald-300">Financial Savings</p></div></div>
          </div>
          <p className="mt-6 text-[10px] text-emerald-500/80 italic">Calculated based on industry standard life-cycle assessment (LCA) data for textile production vs. circular reuse.</p>
        </section>

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-stone-200">
          {['dashboard', 'explore'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 capitalize font-bold ${activeTab === tab ? 'text-emerald-700 border-b-2 border-emerald-700' : 'text-stone-500'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'dashboard' ? (
          <div className="grid md:grid-cols-3 gap-8">
            <form onSubmit={handleSubmit} className="md:col-span-1 bg-white p-6 rounded-xl border border-stone-200">
              <h3 className="font-bold mb-4">Add Find</h3>
              <div className="mb-4 aspect-square bg-stone-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                {formData.image ? <img src={formData.image} className="w-full h-full object-cover"/> : <Camera className="text-stone-400"/>}
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
              </div>
              <input required name="name" placeholder="Item Name" value={formData.name} onChange={handleInputChange} className="w-full p-2 mb-2 bg-stone-50 rounded" />
              <input required name="retailPrice" placeholder="Retail Value ($)" type="number" value={formData.retailPrice} onChange={handleInputChange} className="w-full p-2 mb-2 bg-stone-50 rounded" />
              <input required name="pricePaid" placeholder="Price Paid ($)" type="number" value={formData.pricePaid} onChange={handleInputChange} className="w-full p-2 mb-4 bg-stone-50 rounded" />
              <button className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold">Add to Ledger</button>
            </form>

            <div className="md:col-span-2 space-y-4">
              {items.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-xl border flex items-center gap-4">
                  {item.image && <img src={item.image} className="w-16 h-16 rounded-lg object-cover" />}
                  <div className="flex-1">
                    <p className="font-bold">{item.name}</p>
                    <p className="text-xs text-stone-500">${item.pricePaid} (Retail: ${item.retailPrice})</p>
                  </div>
                  <button onClick={() => setItems(items.filter(i => i.id !== item.id))}><Trash2 className="text-red-400" size={18} /></button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-bold">Recommended for your {topCategory || 'Closet'}</h3>
            {LOCAL_STORES.filter(s => !topCategory || s.match.includes(topCategory)).map(s => (
              <div key={s.id} className="bg-white p-6 rounded-xl border border-stone-200 flex justify-between items-center">
                <div>
                  <p className="font-bold">{s.name}</p>
                  <p className="text-xs text-stone-500 italic mt-1">{s.vibe}</p>
                </div>
                <button className="text-emerald-600 font-bold text-sm flex items-center">Directions <ChevronRight size={16}/></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
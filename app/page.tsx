"use client";

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trash2, Leaf, Target, Store, Share2, Plus, Info, X, Droplets, Gauge } from 'lucide-react';

interface ThriftItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  pricePaid: number;
  retailPrice: number;
  wears: number;
}

interface WishlistItem {
  id: string;
  name: string;
  maxPrice: number;
}

const ENV_FACTORS: Record<string, { water: number, co2: number, waste: number }> = {
  'Tops': { water: 500, co2: 2, waste: 0.5 },
  'Bottoms': { water: 1800, co2: 4, waste: 1.0 },
  'Outerwear': { water: 1000, co2: 5, waste: 2.0 },
  'Footwear': { water: 500, co2: 3, waste: 1.0 },
};

const LOCAL_STORES = [
  { name: '2nd Street', type: 'Curated Vintage', match: ['Outerwear', 'Footwear', 'Tops'] },
  { name: 'Goodwill Outlet', type: 'Pay-by-pound', match: ['Tops', 'Bottoms'] },
  { name: 'Red Light Exchange', type: 'Vintage', match: ['Outerwear', 'Tops'] }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [items, setItems] = useState<ThriftItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const sI = localStorage.getItem('thriftedItems');
    const sW = localStorage.getItem('thriftTrackerWishlist');
    if (sI) setItems(JSON.parse(sI));
    if (sW) setWishlist(JSON.parse(sW));
  }, []);

  const totalSaved = items.reduce((acc, i) => acc + (i.retailPrice - i.pricePaid), 0);
  const totalWater = items.reduce((acc, i) => acc + (ENV_FACTORS[i.category]?.water || 500), 0);
  const avgCPW = items.length > 0 ? (items.reduce((acc, i) => acc + (i.pricePaid / (i.wears || 1)), 0) / items.length) : 0;

  return (
    <div className="min-h-screen bg-stone-50 pb-24 font-sans max-w-md mx-auto">
      <header className="p-4 bg-white border-b flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold">ThriftTracker</h1>
        <button onClick={() => setIsSharing(true)} className="p-2 bg-stone-900 text-white rounded-full"><Share2 size={18}/></button>
      </header>

      <div className="p-4 space-y-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-600 text-white p-4 rounded-xl">
                <p className="text-emerald-100 text-[10px] uppercase font-bold">Money Saved</p>
                <p className="font-bold text-2xl">${totalSaved.toFixed(0)}</p>
              </div>
              <div className="bg-blue-600 text-white p-4 rounded-xl">
                <p className="text-blue-100 text-[10px] uppercase font-bold">Water Saved</p>
                <p className="font-bold text-2xl">{totalWater.toLocaleString()} gal</p>
              </div>
            </div>

            <button onClick={() => setShowInfo(!showInfo)} className="w-full text-xs text-stone-500 flex items-center justify-center gap-1">
              <Info size={12}/> How is this calculated?
            </button>
            {showInfo && (
              <div className="bg-white p-4 rounded-xl border text-xs text-stone-600 italic">
                Calculations are based on industry averages for garment production. Savings = Retail - Paid. CPW = Paid / Wears.
              </div>
            )}

            {items.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-xl border flex justify-between items-center">
                <div><p className="font-bold">{item.name}</p><p className="text-xs text-stone-500">CPW: ${(item.pricePaid / (item.wears || 1)).toFixed(2)}</p></div>
                <button onClick={() => setItems(items.map(i => i.id === item.id ? {...i, wears: i.wears + 1} : i))} className="bg-stone-100 px-3 py-1 rounded-full text-xs font-bold">+ Wear</button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div className="space-y-4">
            <h2 className="font-bold">BOLO (Be On the Lookout)</h2>
            {wishlist.map(w => (
              <div key={w.id} className="bg-white p-4 rounded-xl border flex justify-between">
                <span>{w.name}</span>
                <span className="font-bold">${w.maxPrice}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'explore' && (
          <div className="space-y-4">
            <h2 className="font-bold">Stores for your style</h2>
            {LOCAL_STORES.map(s => (
              <div key={s.name} className="bg-white p-4 rounded-xl border flex items-center gap-3">
                <Store size={20} className="text-stone-400"/>
                <div><p className="font-bold">{s.name}</p><p className="text-xs">{s.type}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 w-full max-w-md bg-white border-t p-4 flex justify-around shadow-lg">
        <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'text-emerald-600 font-bold' : 'text-stone-400'}>Ledger</button>
        <button onClick={() => setActiveTab('wishlist')} className={activeTab === 'wishlist' ? 'text-emerald-600 font-bold' : 'text-stone-400'}>BOLO</button>
        <button onClick={() => setActiveTab('explore')} className={activeTab === 'explore' ? 'text-emerald-600 font-bold' : 'text-stone-400'}>Explore</button>
      </nav>
    </div>
  );
}
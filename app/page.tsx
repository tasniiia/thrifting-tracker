"use client";

import React, { useState, useEffect } from 'react';
import { Share2, Trash2, Plus, Info, Store, Target, Tag, X, Droplets, Leaf, DollarSign } from 'lucide-react';

interface ThriftItem {
  id: string;
  name: string;
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

export default function App() {
  const [items, setItems] = useState<ThriftItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // New Item State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [retail, setRetail] = useState('');

  useEffect(() => {
    const savedItems = localStorage.getItem('thriftedItems');
    const savedWishlist = localStorage.getItem('thriftTrackerWishlist');
    if (savedItems) setItems(JSON.parse(savedItems));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
  }, []);

  const totalSaved = items.reduce((acc, i) => acc + (i.retailPrice - i.pricePaid), 0);
  const avgCPW = items.length > 0 ? (items.reduce((acc, i) => acc + (i.pricePaid / (i.wears || 1)), 0) / items.length) : 0;
  
  const impact = { water: items.length * 500, co2: items.length * 2.5 };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem = {
      id: crypto.randomUUID(),
      name,
      category: 'General',
      pricePaid: parseFloat(price) || 0,
      retailPrice: parseFloat(retail) || 0,
      wears: 0
    };
    const updated = [newItem, ...items];
    setItems(updated);
    localStorage.setItem('thriftedItems', JSON.stringify(updated));
    setName(''); setPrice(''); setRetail('');
  };

  const addWear = (id: string) => {
    const updated = items.map(item => item.id === id ? { ...item, wears: item.wears + 1 } : item);
    setItems(updated);
    localStorage.setItem('thriftedItems', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-stone-50 p-4 md:p-8 font-sans">
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black tracking-tighter">ThriftTracker</h1>
        <button onClick={() => setIsSharing(true)} className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-full font-bold">
          <Share2 size={16} /> Haul Flex
        </button>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar / Stats Section */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h2 className="font-bold text-lg mb-4">Impact Dashboard</h2>
            <div className="space-y-4">
              <div><p className="text-xs text-stone-500 font-bold uppercase">Total Saved</p><p className="text-3xl font-black">${totalSaved.toFixed(0)}</p></div>
              <div><p className="text-xs text-stone-500 font-bold uppercase">Avg Cost/Wear</p><p className="text-3xl font-black">${avgCPW.toFixed(2)}</p></div>
              <div className="pt-4 border-t border-stone-100 flex gap-4">
                <div className="text-center"><Droplets className="mx-auto text-blue-500" /><p className="font-bold">{impact.water} gal</p></div>
                <div className="text-center"><Leaf className="mx-auto text-emerald-500" /><p className="font-bold">{impact.co2} kg</p></div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border shadow-sm text-xs text-stone-400">
            <h4 className="font-bold text-stone-800 mb-2 flex items-center gap-2"><Info size={14}/> Impact Methodology</h4>
            <p>Financial savings = Retail Value minus Price Paid. Environmental metrics reflect industry averages for water/CO2 production reduction by extending garment lifecycle.</p>
          </div>
        </div>

        {/* Main Feed Section */}
        <div className="md:col-span-2 bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="flex border-b">
            {['dashboard', 'bolo'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 p-4 font-bold capitalize ${activeTab === tab ? 'border-b-2 border-stone-900' : 'text-stone-400'}`}>
                {tab === 'dashboard' ? 'My Ledger' : 'BOLO List'}
              </button>
            ))}
          </div>
          
          <div className="p-6">
            {activeTab === 'dashboard' ? (
              <div className="space-y-6">
                <form onSubmit={addItem} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-stone-50 rounded-lg border">
                  <input className="p-2 border rounded" placeholder="Item Name" value={name} onChange={e => setName(e.target.value)} />
                  <input className="p-2 border rounded" placeholder="Price Paid ($)" value={price} onChange={e => setPrice(e.target.value)} />
                  <input className="p-2 border rounded" placeholder="Retail ($)" value={retail} onChange={e => setRetail(e.target.value)} />
                  <button className="bg-emerald-600 text-white font-bold rounded">Add Item</button>
                </form>
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-4 bg-stone-50 rounded-lg">
                    <div>
                      <p className="font-bold">{item.name}</p>
                      <p className="text-xs text-stone-500">{item.wears} wears • ${item.pricePaid} paid</p>
                    </div>
                    <button onClick={() => addWear(item.id)} className="bg-emerald-600 text-white px-4 py-2 rounded-full text-xs font-bold">+ Wear</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-stone-500 italic">BOLO List: {wishlist.length} items hunted.</div>
            )}
          </div>
        </div>
      </main>

      {/* Share Modal */}
      {isSharing && (
        <div className="fixed inset-0 z-50 bg-black/90 p-4 flex items-center justify-center">
          <div className="bg-white w-full max-w-sm aspect-[9/16] p-8 rounded-3xl relative flex flex-col items-center justify-between text-center">
            <button onClick={() => setIsSharing(false)} className="absolute top-6 right-6"><X /></button>
            <h2 className="text-3xl font-black mt-8">My Thrift Haul</h2>
            <div className="w-full space-y-4">
              <p className="text-6xl font-black">${totalSaved.toFixed(0)}</p>
              <p className="text-stone-500 uppercase font-bold text-xs tracking-widest">Total Value Saved</p>
            </div>
            <div className="text-xs text-stone-400 pb-4">Generated by ThriftTracker</div>
          </div>
        </div>
      )}
    </div>
  );
}
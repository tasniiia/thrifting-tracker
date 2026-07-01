"use client";

import React, { useState, useEffect } from 'react';
import { 
  Camera, Trash2, Edit2, Plus, Info, Store, Target, MapPin, 
  Droplets, Leaf, X, Share2, DollarSign, Image as ImageIcon 
} from 'lucide-react';

const ENVIRONMENTAL_CONSTANTS: Record<string, { water: number; co2: number; waste: number }> = {
  Tops: { water: 500, co2: 2, waste: 0.5 },
  Bottoms: { water: 1800, co2: 4, waste: 1.0 },
  Dresses: { water: 1200, co2: 3.5, waste: 1.2 },
  Outerwear: { water: 1000, co2: 5, waste: 2.0 },
  Footwear: { water: 500, co2: 3, waste: 1.0 },
  Home: { water: 300, co2: 2, waste: 2.0 }
};

const LOCAL_STORES = [
  { name: '2nd Street Portland', type: 'Curated Vintage', match: ['Outerwear', 'Footwear', 'Tops'], vibe: 'High-end finds in the Pearl' },
  { name: 'Goodwill Bins', type: 'Pay-by-pound', match: ['Tops', 'Bottoms', 'Home'], vibe: 'The thrill of the hunt' },
  { name: 'Red Light Exchange', type: 'Vintage', match: ['Dresses', 'Tops'], vibe: 'Classic curated retro' },
  { name: 'Crossroads', type: 'Buy/Sell/Trade', match: ['Footwear', 'Tops'], vibe: 'Modern resale gems' }
];

interface ThriftItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  pricePaid: number;
  retailPrice: number;
  wears: number;
  image: string | null;
}

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [items, setItems] = useState<ThriftItem[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', brand: '', category: 'Tops', pricePaid: '', retailPrice: '', image: null as string | null });

  useEffect(() => {
    const saved = localStorage.getItem('thriftedItems');
    if (saved) setItems(JSON.parse(saved));
    setIsLoaded(true);
  }, []);

  const saveItems = (newItems: ThriftItem[]) => {
    setItems(newItems);
    localStorage.setItem('thriftedItems', JSON.stringify(newItems));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(p => ({ ...p, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      saveItems(items.map(i => i.id === editingId ? { ...i, ...formData, pricePaid: parseFloat(formData.pricePaid), retailPrice: parseFloat(formData.retailPrice) } : i));
      setEditingId(null);
    } else {
      const newItem: ThriftItem = { id: crypto.randomUUID(), ...formData, pricePaid: parseFloat(formData.pricePaid) || 0, retailPrice: parseFloat(formData.retailPrice) || 0, wears: 0 };
      saveItems([newItem, ...items]);
    }
    setFormData({ name: '', brand: '', category: 'Tops', pricePaid: '', retailPrice: '', image: null });
  };

  if (!isLoaded) return <div className="min-h-screen bg-stone-50 flex items-center justify-center italic text-stone-400">Loading your sanctuary...</div>;

  const totalSaved = items.reduce((acc, i) => acc + (i.retailPrice - i.pricePaid), 0);
  const topCategory = items.length > 0 ? items[0].category : 'Tops';

  return (
    <div className="min-h-screen bg-stone-50 text-emerald-950 p-4 md:p-8">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black italic tracking-tighter">ThriftTracker</h1>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form Panel */}
        <div className="md:col-span-1 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
            <h3 className="font-bold mb-4">{editingId ? 'Edit Find' : 'New Find'}</h3>
            <label className="block w-full h-32 bg-stone-100 rounded-2xl flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-stone-300 mb-4 overflow-hidden">
              {formData.image ? <img src={formData.image} className="h-full w-full object-cover" /> : <><Camera className="text-stone-400"/><span className="text-[10px] font-bold text-stone-400 mt-2 uppercase">Add Photo</span></>}
              <input type="file" className="hidden" onChange={handleImageUpload} />
            </label>
            <input className="w-full p-3 bg-stone-50 rounded-xl border mb-2" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <div className="grid grid-cols-2 gap-2">
              <input className="p-3 bg-stone-50 rounded-xl border" placeholder="Paid ($)" value={formData.pricePaid} onChange={e => setFormData({...formData, pricePaid: e.target.value})} />
              <input className="p-3 bg-stone-50 rounded-xl border" placeholder="Retail ($)" value={formData.retailPrice} onChange={e => setFormData({...formData, retailPrice: e.target.value})} />
            </div>
            <button className="w-full mt-4 bg-emerald-900 text-white py-3 rounded-xl font-bold">{editingId ? 'Save Changes' : 'Log Find'}</button>
          </form>
        </div>

        {/* Dashboard Tabs */}
        <div className="md:col-span-2">
          <div className="flex gap-4 mb-6 border-b border-emerald-100 pb-2">
            {['dashboard', 'explore'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`font-bold capitalize pb-2 ${activeTab === tab ? 'text-emerald-900 border-b-2 border-emerald-900' : 'text-stone-400'}`}>{tab}</button>
            ))}
          </div>

          {activeTab === 'dashboard' ? (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-2xl border flex items-center gap-4 shadow-sm">
                  {item.image && <img src={item.image} className="w-16 h-16 rounded-xl object-cover" />}
                  <div className="flex-1">
                    <p className="font-bold">{item.name}</p>
                    <p className="text-xs text-stone-500">${item.pricePaid} • ${item.retailPrice} Retail</p>
                  </div>
                  <button onClick={() => { setEditingId(item.id); setFormData({...item, pricePaid: item.pricePaid.toString(), retailPrice: item.retailPrice.toString()}); }} className="p-2 hover:bg-emerald-50 rounded-lg"><Edit2 size={16}/></button>
                  <button onClick={() => saveItems(items.filter(x => x.id !== item.id))} className="p-2 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-bold text-emerald-950">AI Sourcing Guide for Bethany Area</h4>
              {LOCAL_STORES.filter(s => s.match.includes(topCategory)).map(s => (
                <div key={s.name} className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                  <p className="font-bold text-emerald-950">{s.name}</p>
                  <p className="text-xs text-emerald-800 italic mb-2">"{s.vibe}"</p>
                  <p className="text-[10px] uppercase font-bold text-emerald-600">{s.type}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
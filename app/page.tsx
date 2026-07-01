"use client";

import React, { useState, useEffect } from 'react';
import { 
  Leaf, Camera, Trash2, Edit2, Plus, Info, 
  Store, Target, Search, Share2, Image as ImageIcon, Save, X 
} from 'lucide-react';

// --- Types ---
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

const IMPACT_CALCS: Record<string, { water: number; co2: number }> = {
  'Tops': { water: 500, co2: 2 },
  'Bottoms': { water: 1800, co2: 4 },
  'Dresses': { water: 1200, co2: 3.5 },
  'Outerwear': { water: 1000, co2: 5 },
  'Footwear': { water: 500, co2: 3 }
};

export default function ThriftTracker() {
  const [items, setItems] = useState<ThriftItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', brand: '', category: 'Tops', pricePaid: '', retailPrice: '', image: null as string | null });

  useEffect(() => {
    const saved = localStorage.getItem('thriftedItems');
    if (saved) {
      try { setItems(JSON.parse(saved)); } catch (e) { setItems([]); }
    }
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
      const newItem: ThriftItem = { 
        id: crypto.randomUUID(), 
        ...formData, 
        pricePaid: parseFloat(formData.pricePaid) || 0, 
        retailPrice: parseFloat(formData.retailPrice) || 0, 
        wears: 0 
      };
      saveItems([newItem, ...items]);
    }
    setFormData({ name: '', brand: '', category: 'Tops', pricePaid: '', retailPrice: '', image: null });
  };

  const startEdit = (item: ThriftItem) => {
    setEditingId(item.id);
    setFormData({ name: item.name, brand: item.brand, category: item.category, pricePaid: item.pricePaid.toString(), retailPrice: item.retailPrice.toString(), image: item.image });
  };

  if (!isLoaded) return <div className="min-h-screen bg-stone-50 flex items-center justify-center">Loading your sanctuary...</div>;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-20">
      <header className="bg-emerald-950 text-stone-50 p-6 md:px-12 flex justify-between items-center">
        <h1 className="text-2xl font-black italic tracking-tighter">ThriftTracker</h1>
        <button className="bg-emerald-800 px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2"><Share2 size={12}/> Share Haul</button>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 grid md:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="md:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm sticky top-8">
            <h3 className="font-bold mb-4">{editingId ? 'Edit Item' : 'New Find'}</h3>
            <div className="space-y-4">
              <label className="block w-full h-32 bg-stone-100 rounded-2xl flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-stone-300">
                {formData.image ? <img src={formData.image} className="h-full w-full object-cover rounded-xl" /> : <><Camera className="text-stone-400"/><span className="text-[10px] font-bold text-stone-400 mt-2 uppercase">Add Photo</span></>}
                <input type="file" className="hidden" onChange={handleImageUpload} />
              </label>
              <input className="w-full p-3 bg-stone-50 rounded-xl border" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input className="w-full p-3 bg-stone-50 rounded-xl border" placeholder="Brand" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
              <div className="grid grid-cols-2 gap-2">
                <input className="p-3 bg-stone-50 rounded-xl border" placeholder="Paid ($)" value={formData.pricePaid} onChange={e => setFormData({...formData, pricePaid: e.target.value})} />
                <input className="p-3 bg-stone-50 rounded-xl border" placeholder="Retail ($)" value={formData.retailPrice} onChange={e => setFormData({...formData, retailPrice: e.target.value})} />
              </div>
              <button className="w-full bg-emerald-900 text-white py-4 rounded-xl font-bold">{editingId ? <Save size={16}/> : <Plus size={16}/>}</button>
            </div>
          </form>
        </div>

        {/* Right Column: Inventory */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex gap-2 mb-6">
            {['dashboard', 'explore'].map(t => <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-full font-bold ${activeTab === t ? 'bg-emerald-900 text-white' : 'bg-white border'}`}>{t}</button>)}
          </div>
          
          {items.map(i => (
            <div key={i.id} className="bg-white p-4 rounded-2xl border border-stone-200 flex items-center gap-4">
              {i.image && <img src={i.image} className="w-16 h-16 rounded-xl object-cover" />}
              <div className="flex-1">
                <p className="font-bold">{i.name}</p>
                <p className="text-xs text-stone-500">{i.brand} • {i.wears} wears</p>
              </div>
              <button onClick={() => startEdit(i)} className="p-2 hover:bg-stone-100 rounded-lg"><Edit2 size={16}/></button>
              <button onClick={() => saveItems(items.filter(x => x.id !== i.id))} className="p-2 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={16}/></button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
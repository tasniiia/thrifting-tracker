"use client";

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Trash2, Edit2, Check, X, ExternalLink, Leaf, Bath, Car, Trash, Info, Plus, Share2, Camera, Shirt, MapPin, Target, Crosshair, Navigation, Sparkles, Store, Tag } from 'lucide-react';

// Explicit interface for our data to satisfy TypeScript
interface ThriftItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  source: string;
  storeName: string;
  pricePaid: number;
  shippingCost: number;
  retailPrice: number;
  productUrl: string;
  wears: number;
  image: string | null;
}

const ENVIRONMENTAL_CONSTANTS: Record<string, { water: number; co2: number; waste: number }> = {
  Tops: { water: 500, co2: 2, waste: 0.5 },
  Bottoms: { water: 1800, co2: 4, waste: 1.0 },
  Dresses: { water: 1200, co2: 3.5, waste: 1.2 },
  Outerwear: { water: 1000, co2: 5, waste: 2.0 },
  Footwear: { water: 500, co2: 3, waste: 1.0 },
  Home: { water: 300, co2: 2, waste: 2.0 }
};

const LOCAL_STORES = [
  { id: 's1', name: '2nd Street (Hawthorne)', type: 'Curated Vintage', price: '$$$', distance: '18 mi', matchCategories: ['Outerwear', 'Footwear', 'Tops'], vibe: "Japanese-style curation. Incredible for high-end streetwear and gorpcore.", query: '2nd Street Hawthorne Portland' },
  { id: 's2', name: 'Goodwill Outlet (The Bins)', type: 'Pay-by-the-pound', price: '$', distance: '8 mi', matchCategories: ['Tops', 'Bottoms', 'Home'], vibe: "The wild west of thrifting. Perfect for volume sourcing basics and worn-in denim.", query: 'Goodwill Outlet Hillsboro OR' },
  { id: 's3', name: 'Red Light Clothing Exchange', type: 'Consignment / Vintage', price: '$$', distance: '16 mi', matchCategories: ['Dresses', 'Tops', 'Bottoms'], vibe: "Eclectic, heavily curated 90s/Y2K vintage. Great for statement pieces.", query: 'Red Light Clothing Exchange Portland' },
  { id: 's4', name: 'House of Vintage', type: 'Vintage Collective', price: '$$$', distance: '17 mi', matchCategories: ['Tops', 'Bottoms', 'Outerwear'], vibe: "A massive maze of independent vintage vendors. A collector's paradise.", query: 'House of Vintage Portland' },
  { id: 's5', name: 'Crossroads Trading', type: 'Buy / Sell / Trade', price: '$$', distance: '15 mi', matchCategories: ['Footwear', 'Tops', 'Dresses'], vibe: "Trendy, contemporary secondhand. Excellent for finding modern mall brands.", query: 'Crossroads Trading Portland' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [items, setItems] = useState<ThriftItem[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [formData, setFormData] = useState({
    name: '', brand: '', category: 'Tops', source: 'In-Store', storeName: '', pricePaid: '', shippingCost: '', retailPrice: '', productUrl: '', image: null as string | null
  });

  const [boloData, setBoloData] = useState({ name: '', maxPrice: '' });

  useEffect(() => {
    const savedItems = localStorage.getItem('thriftedItems');
    const savedWishlist = localStorage.getItem('thriftTrackerWishlist');
    
    if (savedItems) {
      try { setItems(JSON.parse(savedItems)); } catch (e) { console.error("Failed to parse items"); }
    } else {
      setItems([
        { id: '1', name: 'Vintage Levi 501s', brand: "Levi's", category: 'Bottoms', source: 'In-Store', storeName: 'Goodwill', pricePaid: 15, shippingCost: 0, retailPrice: 90, productUrl: '', wears: 5, image: null },
        { id: '2', name: 'Patagonia Fleece', brand: 'Patagonia', category: 'Outerwear', source: 'In-Store', storeName: 'Local Consignment', pricePaid: 25, shippingCost: 0, retailPrice: 139, productUrl: '', wears: 2, image: null }
      ]);
    }

    if (savedWishlist) {
      try { setWishlist(JSON.parse(savedWishlist)); } catch (e) { console.error("Failed to parse wishlist"); }
    } else {
      setWishlist([{ id: 'w1', name: 'Vintage Coach Station Bag', maxPrice: 40 }, { id: 'w2', name: 'Carhartt Detroit Jacket', maxPrice: 60 }]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('thriftedItems', JSON.stringify(items));
      localStorage.setItem('thriftTrackerWishlist', JSON.stringify(wishlist));
    }
  }, [items, wishlist, isLoaded]);

  const metrics = items.reduce((acc, item) => {
    const cost = item.pricePaid + (item.shippingCost || 0);
    const savings = item.retailPrice - cost;
    const impact = ENVIRONMENTAL_CONSTANTS[item.category] || ENVIRONMENTAL_CONSTANTS['Tops'];
    return {
      financialSaved: acc.financialSaved + (savings > 0 ? savings : 0),
      waterSaved: acc.waterSaved + impact.water,
      co2Avoided: acc.co2Avoided + impact.co2,
      wasteDiverted: acc.wasteDiverted + impact.waste,
    };
  }, { financialSaved: 0, waterSaved: 0, co2Avoided: 0, wasteDiverted: 0 });

  const totalCostForCpw = items.reduce((sum, item) => sum + (item.pricePaid + (item.shippingCost || 0)), 0);
  const totalWears = items.reduce((sum, item) => sum + (item.wears || 0), 0);
  const avgCpw = items.length > 0 && totalWears > 0 ? (totalCostForCpw / totalWears) : (items.length > 0 ? (totalCostForCpw / items.length) : 0);

  const topSteals = [...items]
    .map(item => ({ ...item, netSavings: item.retailPrice - (item.pricePaid + (item.shippingCost || 0)) }))
    .sort((a, b) => b.netSavings - a.netSavings)
    .slice(0, 3);

  const chartData = Object.values(items.reduce((acc: any, item) => {
    if (!acc[item.category]) acc[item.category] = { category: item.category, spent: 0, retail: 0 };
    acc[item.category].spent += (item.pricePaid + (item.shippingCost || 0));
    acc[item.category].retail += item.retailPrice;
    return acc;
  }, {}));

  const topCategory = items.length > 0 ? items.reduce((a, b) => (items.filter(x => x.category === a).length >= items.filter(x => x.category === b.category).length) ? a : b.category, items[0].category) : null;
  const sortedStores = [...LOCAL_STORES].sort((a, b) => {
    const aMatch = topCategory ? a.matchCategories.includes(topCategory) : false;
    const bMatch = topCategory ? b.matchCategories.includes(topCategory) : false;
    return (aMatch === bMatch) ? 0 : aMatch ? -1 : 1;
  });

  const handleInputChange = (e: any) => { setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })); };
  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event: any) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width, height = img.height;
        if (width > height) { if (width > 300) { height *= 300 / width; width = 300; } } else { if (height > 300) { width *= 300 / height; height = 300; } }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        setFormData(prev => ({ ...prev, image: canvas.toDataURL('image/jpeg', 0.8) }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const newItem: ThriftItem = {
      ...formData,
      id: crypto.randomUUID(),
      pricePaid: parseFloat(formData.pricePaid) || 0,
      shippingCost: formData.source === 'Online' ? (parseFloat(formData.shippingCost) || 0) : 0,
      retailPrice: parseFloat(formData.retailPrice) || 0,
      wears: 0
    };
    setItems([newItem, ...items]);
    setFormData({ name: '', brand: '', category: 'Tops', source: formData.source, storeName: '', pricePaid: '', shippingCost: '', retailPrice: '', productUrl: '', image: null });
  };

  const deleteItem = (id: string) => setItems(items.filter(item => item.id !== id));
  const addWear = (id: string) => setItems(items.map(item => item.id === id ? { ...item, wears: (item.wears || 0) + 1 } : item));
  
  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-stone-50 text-slate-800 pb-24 sm:pb-12">
      <header className="bg-white border-b border-stone-200 py-4 px-6 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-stone-800">ThriftTracker</h1>
          <button onClick={() => setIsSharing(true)} className="bg-stone-900 text-white px-4 py-2 rounded-full text-sm font-medium">Share</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-stone-200"><p className="text-stone-500 text-xs">Total Saved</p><p className="font-bold text-lg">${metrics.financialSaved.toFixed(2)}</p></div>
              <div className="bg-white p-4 rounded-xl border border-stone-200"><p className="text-stone-500 text-xs">CO2 Avoided</p><p className="font-bold text-lg">{metrics.co2Avoided.toFixed(1)} kg</p></div>
              <div className="bg-white p-4 rounded-xl border border-stone-200"><p className="text-stone-500 text-xs">Water Saved</p><p className="font-bold text-lg">{metrics.waterSaved.toLocaleString()} gal</p></div>
              <div className="bg-white p-4 rounded-xl border border-stone-200"><p className="text-stone-500 text-xs">Items</p><p className="font-bold text-lg">{items.length}</p></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-stone-200">
                <h2 className="font-bold mb-4">Log a Find</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2 border rounded-lg" placeholder="Item Name" />
                  <input required type="number" name="pricePaid" value={formData.pricePaid} onChange={handleInputChange} className="w-full p-2 border rounded-lg" placeholder="Price Paid" />
                  <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-2 rounded-lg">Add Item</button>
                </form>
              </div>
              <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-stone-200">
                <h2 className="font-bold mb-4">Closet</h2>
                {items.map(item => (
                  <div key={item.id} className="flex justify-between p-3 border-b">{item.name} <button onClick={() => deleteItem(item.id)} className="text-red-500">Delete</button></div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 sm:hidden z-50">
        <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'text-emerald-600' : 'text-stone-400'}>Dashboard</button>
        <button onClick={() => setActiveTab('wishlist')} className={activeTab === 'wishlist' ? 'text-emerald-600' : 'text-stone-400'}>BOLO</button>
        <button onClick={() => setActiveTab('explore')} className={activeTab === 'explore' ? 'text-emerald-600' : 'text-stone-400'}>Explore</button>
      </nav>

      {isSharing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4">
          <div className="relative w-full max-w-[360px] aspect-[9/16] bg-emerald-950 rounded-3xl p-6 text-white flex flex-col">
            <button onClick={() => setIsSharing(false)} className="absolute top-4 right-4"><X /></button>
            <h2 className="text-5xl font-black text-center mt-8">${metrics.financialSaved.toFixed(0)}</h2>
            <p className="text-emerald-300 text-center mb-8">Saved by thrifting</p>
            <div className="space-y-4">
              {topSteals.map(item => (
                <div key={item.id} className="flex items-center gap-4 bg-white/10 p-3 rounded-xl">
                  {item.image && <img src={item.image} className="w-12 h-12 rounded-lg object-cover" />}
                  <div>
                    <p className="font-bold text-sm">{item.name}</p>
                    <p className="text-emerald-400 text-xs">${item.retailPrice - (item.pricePaid + item.shippingCost)} Saved</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
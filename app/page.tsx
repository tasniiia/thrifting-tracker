"use client";

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Trash2, Edit2, Check, X, ExternalLink, Leaf, Bath, Car, Trash, Info, Plus, Share2, Camera, Shirt, MapPin, Target, Crosshair, Navigation, Search, Sparkles, Store, Tag } from 'lucide-react';

const ENVIRONMENTAL_CONSTANTS: Record<string, { water: number; co2: number; waste: number }> = {
  Tops: { water: 500, co2: 2, waste: 0.5 },
  Bottoms: { water: 1800, co2: 4, waste: 1.0 },
  Dresses: { water: 1200, co2: 3.5, waste: 1.2 },
  Outerwear: { water: 1000, co2: 5, waste: 2.0 },
  Footwear: { water: 500, co2: 3, waste: 1.0 },
  Home: { water: 300, co2: 2, waste: 2.0 }
};

const LOCAL_STORES = [
  {
    id: 's1',
    name: '2nd Street (Hawthorne)',
    type: 'Curated Vintage',
    price: '$$$',
    distance: '18 mi from Bethany',
    matchCategories: ['Outerwear', 'Footwear', 'Tops'],
    vibe: "Japanese-style curation. Incredible for high-end streetwear, gorpcore, and rare designer vintage.",
    query: '2nd Street Hawthorne Portland'
  },
  {
    id: 's2',
    name: 'Goodwill Outlet (The Bins)',
    type: 'Pay-by-the-pound',
    price: '$',
    distance: '8 mi from Bethany',
    matchCategories: ['Tops', 'Bottoms', 'Home'],
    vibe: "The wild west of thrifting. Perfect for volume sourcing basics, worn-in denim, and blanks.",
    query: 'Goodwill Outlet Hillsboro OR'
  },
  {
    id: 's3',
    name: 'Red Light Clothing Exchange',
    type: 'Consignment / Vintage',
    price: '$$',
    distance: '16 mi from Bethany',
    matchCategories: ['Dresses', 'Tops', 'Bottoms'],
    vibe: "Eclectic, heavily curated 90s/Y2K vintage. Great for statement pieces and unique party wear.",
    query: 'Red Light Clothing Exchange Portland'
  },
  {
    id: 's4',
    name: 'House of Vintage',
    type: 'Vintage Collective',
    price: '$$$',
    distance: '17 mi from Bethany',
    matchCategories: ['Tops', 'Bottoms', 'Outerwear'],
    vibe: "A massive maze of independent vintage vendors. A collector's paradise.",
    query: 'House of Vintage Portland'
  },
  {
    id: 's5',
    name: 'Crossroads Trading',
    type: 'Buy / Sell / Trade',
    price: '$$',
    distance: '15 mi from Bethany',
    matchCategories: ['Footwear', 'Tops', 'Dresses'],
    vibe: "Trendy, contemporary secondhand. Excellent for finding modern mall brands and recent designer pieces.",
    query: 'Crossroads Trading Portland'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [items, setItems] = useState<any[]>([]); // TypeScript fix applied here
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'Tops',
    source: 'In-Store',
    storeName: '',
    pricePaid: '',
    shippingCost: '',
    retailPrice: '',
    productUrl: '',
    image: null as string | null
  });

  const [boloData, setBoloData] = useState({ name: '', maxPrice: '' });

  useEffect(() => {
    const savedItems = localStorage.getItem('thriftedItems');
    const savedWishlist = localStorage.getItem('thriftTrackerWishlist');
    
    if (savedItems) {
      try { setItems(JSON.parse(savedItems)); } catch (e) { console.error("Failed to parse items"); }
    } else {
      const mockData = [
        { id: '1', name: 'Vintage Levi 501s', brand: "Levi's", category: 'Bottoms', source: 'In-Store', storeName: 'Goodwill', pricePaid: 15, shippingCost: 0, retailPrice: 90, productUrl: '', wears: 5, image: null },
        { id: '2', name: 'Patagonia Fleece', brand: 'Patagonia', category: 'Outerwear', source: 'In-Store', storeName: 'Local Consignment', pricePaid: 25, shippingCost: 0, retailPrice: 139, productUrl: '', wears: 2, image: null }
      ];
      setItems(mockData);
      localStorage.setItem('thriftedItems', JSON.stringify(mockData));
    }

    if (savedWishlist) {
      try { setWishlist(JSON.parse(savedWishlist)); } catch (e) { console.error("Failed to parse wishlist"); }
    } else {
      const mockWishlist = [
        { id: 'w1', name: 'Vintage Coach Station Bag', maxPrice: 40 },
        { id: 'w2', name: 'Carhartt Detroit Jacket', maxPrice: 60 }
      ];
      setWishlist(mockWishlist);
      localStorage.setItem('thriftTrackerWishlist', JSON.stringify(mockWishlist));
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

  const totalCostForCpw = items.reduce((sum: number, item: any) => sum + (item.pricePaid + (item.shippingCost || 0)), 0);
  const totalWears = items.reduce((sum: number, item: any) => sum + (item.wears || 0), 0);
  const avgCpw = items.length > 0 && totalWears > 0 ? (totalCostForCpw / totalWears) : (items.length > 0 ? (totalCostForCpw / items.length) : 0);

  const topSteals = [...items]
    .map(item => ({ ...item, netSavings: item.retailPrice - (item.pricePaid + (item.shippingCost || 0)) }))
    .sort((a, b) => b.netSavings - a.netSavings)
    .slice(0, 3);

  const chartData = Object.values(items.reduce((acc: any, item: any) => {
    if (!acc[item.category]) acc[item.category] = { category: item.category, spent: 0, retail: 0 };
    acc[item.category].spent += (item.pricePaid + (item.shippingCost || 0));
    acc[item.category].retail += item.retailPrice;
    return acc;
  }, {}));

  const categoryCounts = items.reduce((acc: any, item: any) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});
  
  const topCategory = Object.keys(categoryCounts).length > 0 
    ? Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b)
    : null;

  const sortedStores = [...LOCAL_STORES].sort((a, b) => {
    if (!topCategory) return 0;
    const aMatch = a.matchCategories.includes(topCategory);
    const bMatch = b.matchCategories.includes(topCategory);
    return (aMatch === bMatch) ? 0 : aMatch ? -1 : 1;
  });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSourceToggle = (newSource: string) => {
    setFormData(prev => ({ ...prev, source: newSource }));
  };

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event: any) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width, height = img.height;
        if (width > height) { if (width > 300) { height *= 300 / width; width = 300; } } 
        else { if (height > 300) { width *= 300 / height; height = 300; } }
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
    const newItem = {
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
  
  const handleEditClick = (item: any) => { setEditingId(item.id); setEditFormData({ ...item }); };
  const handleEditChange = (e: any) => setEditFormData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleEditSave = () => {
    setItems(items.map(item => item.id === editingId ? {
      ...editFormData,
      pricePaid: parseFloat(editFormData.pricePaid) || 0,
      shippingCost: parseFloat(editFormData.shippingCost) || 0,
      retailPrice: parseFloat(editFormData.retailPrice) || 0,
      wears: parseInt(editFormData.wears) || 0
    } : item));
    setEditingId(null);
  };

  const handleBoloSubmit = (e: any) => {
    e.preventDefault();
    if (!boloData.name) return;
    const newItem = { id: crypto.randomUUID(), name: boloData.name, maxPrice: parseFloat(boloData.maxPrice) || 0 };
    setWishlist([newItem, ...wishlist]);
    setBoloData({ name: '', maxPrice: '' });
  };

  const deleteBolo = (id: string) => setWishlist(wishlist.filter(w => w.id !== id));

  const handleFoundBolo = (item: any) => {
    setActiveTab('dashboard');
    setFormData(prev => ({
      ...prev,
      name: item.name,
      retailPrice: item.maxPrice > 0 ? item.maxPrice : '',
      source: 'In-Store',
    }));
    deleteBolo(item.id);
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-stone-50 text-slate-800 font-sans pb-24 sm:pb-12 relative selection:bg-emerald-200">
      <header className="bg-white border-b border-stone-200 py-4 sm:py-6 px-4 sm:px-8 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Leaf className="text-emerald-700 w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-800 tracking-tight">ThriftTracker</h1>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-stone-500">Avg Cost Per Wear</p>
              <p className="text-xl font-bold text-emerald-600">${avgCpw.toFixed(2)}</p>
            </div>
            <button 
              onClick={() => setIsSharing(true)}
              className="bg-stone-900 hover:bg-stone-800 text-white p-2 sm:px-4 sm:py-2 rounded-full font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
              title="Share Impact"
            >
              <Share2 size={16} /> <span className="hidden sm:inline">Share Impact</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-6 mb-8 hidden sm:block">
        <div className="flex bg-stone-200/60 p-1 rounded-xl w-max shadow-inner">
          <button onClick={() => setActiveTab('dashboard')} className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
            <Shirt size={16} /> Dashboard
          </button>
          <button onClick={() => setActiveTab('wishlist')} className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'wishlist' ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
            <Target size={16} /> BOLO List
          </button>
          <button onClick={() => setActiveTab('explore')} className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'explore' ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
            <MapPin size={16} /> Store Explorer
          </button>
        </div>
      </div>

      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-50 flex justify-around items-center px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center justify-center w-full py-2 gap-1 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'text-emerald-600' : 'text-stone-400 hover:bg-stone-50'}`}>
          <Shirt size={22} className={activeTab === 'dashboard' ? 'fill-emerald-100' : ''} />
          <span className="text-[10px] font-bold tracking-wide">Dashboard</span>
        </button>
        <button onClick={() => setActiveTab('wishlist')} className={`flex flex-col items-center justify-center w-full py-2 gap-1 rounded-lg transition-colors ${activeTab === 'wishlist' ? 'text-emerald-600' : 'text-stone-400 hover:bg-stone-50'}`}>
          <Target size={22} className={activeTab === 'wishlist' ? 'fill-emerald-100' : ''} />
          <span className="text-[10px] font-bold tracking-wide">BOLO List</span>
        </button>
        <button onClick={() => setActiveTab('explore')} className={`flex flex-col items-center justify-center w-full py-2 gap-1 rounded-lg transition-colors ${activeTab === 'explore' ? 'text-emerald-600' : 'text-stone-400 hover:bg-stone-50'}`}>
          <MapPin size={22} className={activeTab === 'explore' ? 'fill-emerald-100' : ''} />
          <span className="text-[10px] font-bold tracking-wide">Explorer</span>
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6 sm:space-y-8 pt-4 sm:pt-0 animate-in fade-in duration-300">
        {activeTab === 'dashboard' && (
          <div className="space-y-6 sm:space-y-8 animate-in slide-in-from-bottom-4 duration-300">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200 shadow-sm">
                <p className="text-xs sm:text-sm text-stone-500 font-medium mb-1">Total Saved</p>
                <p className="text-xl sm:text-2xl font-bold text-stone-800">${metrics.financialSaved.toFixed(2)}</p>
              </div>
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200 shadow-sm">
                <p className="text-xs sm:text-sm text-stone-500 font-medium mb-1">CO2 Avoided</p>
                <p className="text-xl sm:text-2xl font-bold text-stone-800">{metrics.co2Avoided.toFixed(1)} kg</p>
              </div>
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200 shadow-sm">
                <p className="text-xs sm:text-sm text-stone-500 font-medium mb-1">Water Preserved</p>
                <p className="text-xl sm:text-2xl font-bold text-stone-800">{metrics.waterSaved.toLocaleString()} gal</p>
              </div>
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200 shadow-sm">
                <p className="text-xs sm:text-sm text-stone-500 font-medium mb-1">Items Logged</p>
                <p className="text-xl sm:text-2xl font-bold text-stone-800">{items.length}</p>
              </div>
            </div>

            <div className="bg-emerald-900 rounded-xl overflow-hidden shadow-md">
              <div className="p-5 sm:p-8">
                <h2 className="text-white text-base sm:text-lg font-semibold mb-4 sm:mb-6 flex items-center gap-2">
                  <Leaf size={18} className="text-emerald-400" /> Your Real-World Impact
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="flex items-center sm:items-start gap-4 bg-emerald-800/30 sm:bg-transparent p-3 sm:p-0 rounded-lg">
                    <div className="bg-emerald-800/80 p-2 sm:p-3 rounded-xl border border-emerald-700/50">
                      <Bath className="text-blue-300 w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-white leading-none">{Math.round(metrics.waterSaved / 40).toLocaleString()}</p>
                      <p className="text-emerald-200 text-xs sm:text-sm font-medium mt-1">Bathtubs of Water</p>
                    </div>
                  </div>
                  <div className="flex items-center sm:items-start gap-4 bg-emerald-800/30 sm:bg-transparent p-3 sm:p-0 rounded-lg">
                    <div className="bg-emerald-800/80 p-2 sm:p-3 rounded-xl border border-emerald-700/50">
                      <Car className="text-stone-300 w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-white leading-none">{Math.round(metrics.co2Avoided / 0.4).toLocaleString()}</p>
                      <p className="text-emerald-200 text-xs sm:text-sm font-medium mt-1">Miles in a Car</p>
                    </div>
                  </div>
                  <div className="flex items-center sm:items-start gap-4 bg-emerald-800/30 sm:bg-transparent p-3 sm:p-0 rounded-lg">
                    <div className="bg-emerald-800/80 p-2 sm:p-3 rounded-xl border border-emerald-700/50">
                      <Trash className="text-amber-200 w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold text-white leading-none">{metrics.wasteDiverted.toFixed(1)}</p>
                      <p className="text-emerald-200 text-xs sm:text-sm font-medium mt-1">Lbs of Landfill Waste</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="lg:col-span-1 bg-white p-5 sm:p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col">
                <h2 className="text-lg font-bold mb-4 text-stone-800">Log a Find</h2>
                <form onSubmit={handleSubmit} className="space-y-4 flex-1">
                  <div className="border-2 border-dashed border-stone-300 rounded-lg p-4 text-center relative flex flex-col items-center justify-center min-h-[100px]">
                    {formData.image ? (
                        <div className="relative inline-block group">
                          <img src={formData.image} alt="Preview" className="h-24 w-24 rounded-lg object-cover shadow-sm border border-stone-200" />
                          <button type="button" onClick={() => setFormData(prev => ({...prev, image: null}))} className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md"><X size={14}/></button>
                        </div>
                    ) : (
                        <>
                          <Camera className="text-stone-500 mb-2" size={20} />
                          <p className="text-xs sm:text-sm text-stone-600 font-medium">Add a photo</p>
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                        </>
                    )}
                  </div>
                  <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-3 border border-stone-300 rounded-lg" placeholder="Item Name" />
                  <input required type="number" name="pricePaid" value={formData.pricePaid} onChange={handleInputChange} className="w-full p-3 border border-stone-300 rounded-lg" placeholder="Price Paid" />
                  <input required type="number" name="retailPrice" value={formData.retailPrice} onChange={handleInputChange} className="w-full p-3 border border-stone-300 rounded-lg" placeholder="Retail Value" />
                  <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg">Add to Closet</button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                <h2 className="text-lg font-bold mb-6 text-stone-800">Closet Inventory</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-stone-400"><th>Item</th><th>Paid</th><th>Retail</th><th>Actions</th></tr></thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.id} className="border-t border-stone-100">
                          <td className="py-3 flex items-center gap-3">
                            {item.image && <img src={item.image} className="w-10 h-10 rounded-lg object-cover" />}
                            {item.name}
                          </td>
                          <td>${item.pricePaid}</td>
                          <td>${item.retailPrice}</td>
                          <td><button onClick={() => deleteItem(item.id)} className="text-red-500"><Trash2 size={16} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {isSharing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4">
          <div className="relative w-full max-w-[360px] aspect-[9/16] bg-gradient-to-br from-emerald-950 via-stone-900 to-stone-950 rounded-[2rem] p-6 text-white flex flex-col">
            <button onClick={() => setIsSharing(false)} className="absolute top-4 right-4 text-white/50"><X size={24} /></button>
            <h2 className="text-5xl font-black text-center mt-8">${metrics.financialSaved.toFixed(0)}</h2>
            <p className="text-stone-300 text-center mb-8">Saved by thrifting</p>
            <div className="space-y-4">
              {topSteals.map((item, i) => (
                <div key={item.id} className="flex items-center gap-4 bg-white/10 p-3 rounded-xl">
                  {item.image && <img src={item.image} className="w-12 h-12 rounded-lg object-cover" />}
                  <div className="flex-1">
                    <p className="font-bold text-sm">{item.name}</p>
                    <p className="text-emerald-400 text-xs uppercase font-bold tracking-widest">${(item.retailPrice - (item.pricePaid + (item.shippingCost || 0))).toFixed(0)} Saved</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-auto text-center text-emerald-500/60 text-[10px] font-bold tracking-widest uppercase">thrifttracker.app</div>
          </div>
        </div>
      )}
    </div>
  );
}
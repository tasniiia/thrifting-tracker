"use client";

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Trash2, Edit2, Check, X, ExternalLink, Leaf, Bath, Car, Trash, Info, Plus, Share2, Camera, Shirt, MapPin, Target, Crosshair, Navigation, Search, Sparkles, Store, Tag } from 'lucide-react';

const ENVIRONMENTAL_CONSTANTS = {
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
    vibe: "AI Vibe Match: Japanese-style curation. Incredible for high-end streetwear, gorpcore (Patagonia/Arc'teryx), and rare designer vintage. You won't dig much, but you'll pay a premium for the curation.",
    query: '2nd Street Hawthorne Portland'
  },
  {
    id: 's2',
    name: 'Goodwill Outlet (The Bins)',
    type: 'Pay-by-the-pound',
    price: '$',
    distance: '8 mi from Bethany',
    matchCategories: ['Tops', 'Bottoms', 'Home'],
    vibe: "AI Vibe Match: The wild west of thrifting. Bring gloves. Perfect for volume sourcing basics, worn-in denim, and blanks. Requires patience but yields the highest profit margins.",
    query: 'Goodwill Outlet Hillsboro OR'
  },
  {
    id: 's3',
    name: 'Red Light Clothing Exchange',
    type: 'Consignment / Vintage',
    price: '$$',
    distance: '16 mi from Bethany',
    matchCategories: ['Dresses', 'Tops', 'Bottoms'],
    vibe: "AI Vibe Match: Eclectic, heavily curated 90s/Y2K vintage. It's loud, colorful, and highly organized. Great for statement pieces and unique party wear.",
    query: 'Red Light Clothing Exchange Portland'
  },
  {
    id: 's4',
    name: 'House of Vintage',
    type: 'Vintage Collective',
    price: '$$$',
    distance: '17 mi from Bethany',
    matchCategories: ['Tops', 'Bottoms', 'Outerwear'],
    vibe: "AI Vibe Match: A massive maze of independent vintage vendors. Specializes in true vintage, 80s/90s single-stitch band tees, and mid-century denim. A collector's paradise.",
    query: 'House of Vintage Portland'
  },
  {
    id: 's5',
    name: 'Crossroads Trading',
    type: 'Buy / Sell / Trade',
    price: '$$',
    distance: '15 mi from Bethany',
    matchCategories: ['Footwear', 'Tops', 'Dresses'],
    vibe: "AI Vibe Match: Trendy, contemporary secondhand. Excellent for finding modern mall brands (Zara, Madewell) and recent designer pieces that are currently in season.",
    query: 'Crossroads Trading Portland'
  }
];

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'wishlist', 'explore'

  // Data States
  const [items, setItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  // Dashboard Form States
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
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
    image: null
  });

  // BOLO Form State
  const [boloData, setBoloData] = useState({ name: '', maxPrice: '' });

  // Load data on mount
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

  // Save data to local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('thriftedItems', JSON.stringify(items));
      localStorage.setItem('thriftTrackerWishlist', JSON.stringify(wishlist));
    }
  }, [items, wishlist, isLoaded]);

  // Aggregate Metrics Calculations
  const metrics = items.reduce((acc, item) => {
    const cost = item.pricePaid + (item.shippingCost || 0);
    const savings = item.retailPrice - cost;
    const impact = ENVIRONMENTAL_CONSTANTS[item.category] || ENVIRONMENTAL_CONSTANTS['Tops'];
    return {
      financialSaved: acc.financialSaved + (savings > 0 ? savings : 0),
      waterSaved: acc.waterSaved + impact.water,
      co2Avoided: acc.co2Avoided + impact.co2,
      wasteDiverted: acc.wasteDiverted + impact.waste,
      totalSpent: acc.totalSpent + cost,
      totalRetail: acc.totalRetail + item.retailPrice
    };
  }, { financialSaved: 0, waterSaved: 0, co2Avoided: 0, wasteDiverted: 0, totalSpent: 0, totalRetail: 0 });

  const totalCostForCpw = items.reduce((sum, item) => sum + (item.pricePaid + (item.shippingCost || 0)), 0);
  const totalWears = items.reduce((sum, item) => sum + (item.wears || 0), 0);
  const avgCpw = items.length > 0 && totalWears > 0 ? (totalCostForCpw / totalWears) : (items.length > 0 ? (totalCostForCpw / items.length) : 0);

  const topSteals = [...items]
    .map(item => ({ ...item, netSavings: item.retailPrice - (item.pricePaid + (item.shippingCost || 0)) }))
    .sort((a, b) => b.netSavings - a.netSavings)
    .slice(0, 3);

  const chartData = Object.values(items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = { category: item.category, spent: 0, retail: 0 };
    acc[item.category].spent += (item.pricePaid + (item.shippingCost || 0));
    acc[item.category].retail += item.retailPrice;
    return acc;
  }, {}));

  // AI Store Analysis Logic
  const categoryCounts = items.reduce((acc, item) => {
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

  // Handlers for Dashboard
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'productUrl' && value === '') {
      setFormData(prev => ({ ...prev, productUrl: '', name: '', brand: '', storeName: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSourceToggle = (newSource) => {
    setFormData(prev => ({ ...prev, source: newSource, shippingCost: newSource === 'In-Store' ? '' : prev.shippingCost, productUrl: newSource === 'In-Store' ? '' : prev.productUrl }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width, height = img.height;
        if (width > height) { if (width > 300) { height *= 300 / width; width = 300; } } 
        else { if (height > 300) { width *= 300 / height; height = 300; } }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        setFormData(prev => ({ ...prev, image: canvas.toDataURL('image/jpeg', 0.8) }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
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

  const deleteItem = (id) => setItems(items.filter(item => item.id !== id));
  const addWear = (id) => setItems(items.map(item => item.id === id ? { ...item, wears: (item.wears || 0) + 1 } : item));
  
  const handleEditClick = (item) => { setEditingId(item.id); setEditFormData({ ...item }); };
  const handleEditChange = (e) => setEditFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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

  // Handlers for BOLO Wishlist
  const handleBoloSubmit = (e) => {
    e.preventDefault();
    if (!boloData.name) return;
    const newItem = { id: crypto.randomUUID(), name: boloData.name, maxPrice: parseFloat(boloData.maxPrice) || 0 };
    setWishlist([newItem, ...wishlist]);
    setBoloData({ name: '', maxPrice: '' });
  };

  const deleteBolo = (id) => setWishlist(wishlist.filter(w => w.id !== id));

  const handleFoundBolo = (item) => {
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
    <div className="min-h-screen bg-stone-50 text-slate-800 font-sans pb-12 relative">
      
      {/* Global Header */}
      <header className="bg-white border-b border-stone-200 py-6 px-4 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <Leaf className="text-emerald-700 w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-stone-800 tracking-tight">ThriftTracker</h1>
            </div>
          </div>
          
          <div className="flex items-center justify-between md:justify-end gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-stone-500">Avg Cost Per Wear</p>
              <p className="text-xl font-bold text-emerald-600">${avgCpw.toFixed(2)}</p>
            </div>
            <button 
              onClick={() => setIsSharing(true)}
              className="bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
            >
              <Share2 size={16} /> Share Impact
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-6 mb-8">
        <div className="flex bg-stone-200/60 p-1 rounded-xl w-full sm:w-max overflow-x-auto shadow-inner">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'dashboard' ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            <Shirt size={16} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('wishlist')} 
            className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'wishlist' ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            <Target size={16} /> BOLO List
          </button>
          <button 
            onClick={() => setActiveTab('explore')} 
            className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'explore' ? 'bg-white text-emerald-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            <MapPin size={16} /> Store Explorer
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8 animate-in fade-in duration-300">
        
        {/* =========================================
            TAB 1: DASHBOARD
           ========================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                <p className="text-sm text-stone-500 font-medium mb-1">Total Saved</p>
                <p className="text-2xl font-bold text-stone-800">${metrics.financialSaved.toFixed(2)}</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                <p className="text-sm text-stone-500 font-medium mb-1">CO2 Avoided</p>
                <p className="text-2xl font-bold text-stone-800">{metrics.co2Avoided.toFixed(1)} kg</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                <p className="text-sm text-stone-500 font-medium mb-1">Water Preserved</p>
                <p className="text-2xl font-bold text-stone-800">{metrics.waterSaved.toLocaleString()} gal</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                <p className="text-sm text-stone-500 font-medium mb-1">Items Logged</p>
                <p className="text-2xl font-bold text-stone-800">{items.length}</p>
              </div>
            </div>

            {/* Environmental Education Banner */}
            <div className="bg-emerald-900 rounded-xl overflow-hidden shadow-md">
              <div className="p-6 sm:p-8">
                <h2 className="text-white text-lg font-semibold mb-6 flex items-center gap-2">
                  <Leaf size={20} className="text-emerald-400" /> Your Real-World Impact
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-emerald-800/50 p-3 rounded-xl border border-emerald-700/50">
                      <Bath className="text-blue-300 w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white">{Math.round(metrics.waterSaved / 40).toLocaleString()}</p>
                      <p className="text-emerald-200 text-sm font-medium">Bathtubs of Water</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-emerald-800/50 p-3 rounded-xl border border-emerald-700/50">
                      <Car className="text-stone-300 w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white">{Math.round(metrics.co2Avoided / 0.4).toLocaleString()}</p>
                      <p className="text-emerald-200 text-sm font-medium">Miles Driven in a Car</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-emerald-800/50 p-3 rounded-xl border border-emerald-700/50">
                      <Trash className="text-amber-200 w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white">{metrics.wasteDiverted.toFixed(1)}</p>
                      <p className="text-emerald-200 text-sm font-medium">Lbs of Landfill Waste</p>
                    </div>
                  </div>
                </div>
                
                <details className="mt-8 group cursor-pointer">
                  <summary className="text-emerald-300/90 hover:text-emerald-100 text-sm font-semibold flex items-center gap-2 outline-none transition-colors bg-emerald-800/40 p-3 rounded-lg border border-emerald-700/50 w-max">
                    <Info size={16} /> How exactly are these savings calculated?
                  </summary>
                  <div className="mt-4 p-5 bg-emerald-950/70 rounded-xl text-emerald-50/80 text-sm leading-relaxed border border-emerald-800/50 space-y-4 shadow-inner">
                    <p className="text-base text-white font-medium">By purchasing secondhand, you bypass the massive resource consumption required to manufacture a net-new garment. We calculate your impact using standard Life Cycle Assessment (LCA) data from the global textile industry:</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-blue-300 font-bold border-b border-emerald-800/50 pb-2">
                          <Bath size={16}/> Water Preserved
                        </div>
                        <p>Cotton is an incredibly thirsty crop. Producing a single new pair of jeans requires up to <strong>1,800 gallons of water</strong> for crop growth and fabric dyeing alone. We visualize this in standard bathtubs (which hold ~40 gallons each).</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-stone-300 font-bold border-b border-emerald-800/50 pb-2">
                          <Car size={16}/> Emissions Avoided
                        </div>
                        <p>Manufacturing and globally transporting a heavy winter coat emits around <strong>5kg of CO2</strong>. To put that in perspective, driving an average passenger vehicle for one mile emits roughly 0.4kg of CO2.</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-amber-200 font-bold border-b border-emerald-800/50 pb-2">
                          <Trash size={16}/> Waste Diverted
                        </div>
                        <p>The EPA estimates the average American throws away 81 lbs of clothing annually. Keeping a garment in circulation directly diverts its physical weight (between <strong>0.5 to 2.0 lbs</strong> per item) from entering a landfill.</p>
                      </div>
                    </div>
                  </div>
                </details>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Add Item Form */}
              <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col">
                <h2 className="text-lg font-bold mb-4 text-stone-800">Log a Find</h2>
                
                <div className="flex bg-stone-100 p-1 rounded-lg mb-6">
                  <button type="button" onClick={() => handleSourceToggle('In-Store')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${formData.source === 'In-Store' ? 'bg-white text-emerald-700 shadow-sm border border-stone-200' : 'text-stone-500 hover:text-stone-700'}`}>In-Store</button>
                  <button type="button" onClick={() => handleSourceToggle('Online')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${formData.source === 'Online' ? 'bg-white text-emerald-700 shadow-sm border border-stone-200' : 'text-stone-500 hover:text-stone-700'}`}>Online</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 flex-1">
                  
                  {/* Image Upload Dropzone */}
                  <div className="border-2 border-dashed border-stone-300 rounded-lg p-4 text-center hover:bg-stone-50 transition-colors relative flex flex-col items-center justify-center min-h-[100px]">
                    {formData.image ? (
                        <div className="relative inline-block group">
                          <img src={formData.image} alt="Preview" className="h-24 w-24 rounded-lg object-cover shadow-sm border border-stone-200" />
                          <button type="button" onClick={() => setFormData(prev => ({...prev, image: null}))} className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md transition-colors"><X size={14}/></button>
                        </div>
                    ) : (
                        <>
                          <div className="bg-stone-100 p-2 rounded-full mb-2"><Camera className="text-stone-500" size={20} /></div>
                          <p className="text-xs text-stone-600 font-medium">Add a photo of your find</p>
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="Upload an image"/>
                        </>
                    )}
                  </div>

                  {formData.source === 'Online' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                      <label className="block text-xs font-semibold text-stone-600 mb-1">Paste Link (Auto-fills info)</label>
                      <input type="url" name="productUrl" value={formData.productUrl} onChange={handleInputChange} className="w-full p-2.5 border border-stone-300 rounded-md text-sm outline-none focus:border-emerald-500" placeholder="https://depop.com/..." />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">Item Name</label>
                      <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2.5 border border-stone-300 rounded-md text-sm outline-none focus:border-emerald-500" placeholder="e.g. Levi's 501s" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">Brand (Optional)</label>
                      <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} className="w-full p-2.5 border border-stone-300 rounded-md text-sm outline-none focus:border-emerald-500" placeholder="e.g. Levi's" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">Category</label>
                      <select name="category" value={formData.category} onChange={handleInputChange} className="w-full p-2.5 border border-stone-300 rounded-md text-sm bg-white outline-none focus:border-emerald-500">
                        {Object.keys(ENVIRONMENTAL_CONSTANTS).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 mb-1">Store Name</label>
                      <input required type="text" name="storeName" value={formData.storeName} onChange={handleInputChange} className="w-full p-2.5 border border-stone-300 rounded-md text-sm outline-none focus:border-emerald-500" placeholder={formData.source === 'In-Store' ? 'e.g. Goodwill' : 'e.g. Depop'} />
                    </div>
                  </div>

                  <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 mt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">Price Paid ($)</label>
                        <input required type="number" min="0" step="0.01" name="pricePaid" value={formData.pricePaid} onChange={handleInputChange} className="w-full p-2 border border-stone-300 rounded-md text-sm font-medium outline-none focus:border-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">Est. Retail ($)</label>
                        <input required type="number" min="0" step="0.01" name="retailPrice" value={formData.retailPrice} onChange={handleInputChange} className="w-full p-2 border border-stone-300 rounded-md text-sm font-medium outline-none focus:border-emerald-500" />
                      </div>
                    </div>
                  </div>

                  {formData.source === 'Online' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                      <label className="block text-xs font-semibold text-stone-600 mb-1">Shipping Cost ($)</label>
                      <input type="number" min="0" step="0.01" name="shippingCost" value={formData.shippingCost} onChange={handleInputChange} className="w-full p-2.5 border border-stone-300 rounded-md text-sm outline-none bg-white focus:border-emerald-500" />
                    </div>
                  )}

                  <div className="pt-4 mt-auto">
                     <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-md transition-colors text-sm shadow-sm">
                       Add Item to Closet
                     </button>
                  </div>
                </form>
              </div>

              {/* Value Gap Chart */}
              <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col min-h-[400px]">
                <h2 className="text-lg font-bold mb-6 text-stone-800">Retail vs. Paid Value Gap</h2>
                <div className="flex-1 w-full min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(value) => `$${value}`} />
                      <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`$${value.toFixed(2)}`, '']} />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                      <Bar dataKey="spent" name="Actual Spent" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                      <Bar dataKey="retail" name="Est. Retail Value" fill="#9ca3af" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Ledger Table */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-stone-200 bg-stone-50/50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-stone-800">Closet Inventory & Cost Per Wear</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-stone-600">
                  <thead className="text-xs uppercase bg-stone-100/50 text-stone-500 border-b border-stone-200 whitespace-nowrap">
                    <tr>
                      <th className="px-5 py-4">Item</th>
                      <th className="px-5 py-4">Category</th>
                      <th className="px-5 py-4">Store</th>
                      <th className="px-5 py-4">Retail Value</th>
                      <th className="px-5 py-4">Price Paid</th>
                      <th className="px-5 py-4 text-emerald-600">Savings</th>
                      <th className="px-5 py-4">Wears</th>
                      <th className="px-5 py-4 font-bold text-stone-700">CPW</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {items.length === 0 ? (
                      <tr><td colSpan="9" className="px-5 py-12 text-center text-stone-400">Your closet is empty. Add a find above!</td></tr>
                    ) : items.map((item) => {
                      
                      const isEditing = editingId === item.id;
                      const itemCost = isEditing ? (parseFloat(editFormData.pricePaid||0) + parseFloat(editFormData.shippingCost||0)) : (item.pricePaid + (item.shippingCost || 0));
                      const itemRetail = isEditing ? parseFloat(editFormData.retailPrice||0) : item.retailPrice;
                      const itemSavings = itemRetail - itemCost;
                      const wears = isEditing ? parseInt(editFormData.wears || 0) : (item.wears || 0);
                      const cpw = wears > 0 ? (itemCost / wears) : itemCost;

                      return (
                      <tr key={item.id} className="hover:bg-stone-50/80 transition-colors group">
                        <td className="px-5 py-4 font-medium text-stone-800 max-w-[250px]">
                          {isEditing ? (
                            <div className="space-y-1">
                              <input type="text" name="name" value={editFormData.name} onChange={handleEditChange} className="w-full p-1.5 border rounded placeholder-stone-400" placeholder="Name" />
                              <input type="text" name="brand" value={editFormData.brand} onChange={handleEditChange} className="w-full p-1.5 border rounded placeholder-stone-400 text-xs" placeholder="Brand" />
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-stone-200 shadow-sm flex-shrink-0" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center flex-shrink-0">
                                   <Shirt size={18} className="text-stone-400" />
                                </div>
                              )}
                              <div className="flex flex-col min-w-0">
                                <span className="truncate">{item.name}</span>
                                {item.brand && <span className="text-xs text-stone-400 mt-0.5 truncate">{item.brand}</span>}
                                {item.productUrl && (
                                  <a href={item.productUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline inline-flex items-center gap-1 truncate mt-0.5">
                                    Link <ExternalLink size={10} />
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                           {isEditing ? (
                             <select name="category" value={editFormData.category} onChange={handleEditChange} className="p-1.5 border rounded w-full">
                               {Object.keys(ENVIRONMENTAL_CONSTANTS).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                             </select>
                           ) : (
                             <span className="inline-block bg-stone-100 text-stone-600 px-2 py-1 rounded text-xs font-medium">{item.category}</span>
                           )}
                        </td>
                        <td className="px-5 py-4">
                           {isEditing ? (
                            <input type="text" name="storeName" value={editFormData.storeName} onChange={handleEditChange} className="w-full p-1.5 border rounded" />
                           ) : (
                            <span className="truncate max-w-[120px] inline-block">{item.storeName}</span>
                           )}
                        </td>
                        <td className="px-5 py-4 text-stone-400 line-through decoration-stone-300">
                          {isEditing ? (
                            <div className="flex items-center gap-1">$<input type="number" name="retailPrice" value={editFormData.retailPrice} onChange={handleEditChange} className="w-16 p-1.5 border rounded text-xs no-underline" /></div>
                          ) : (`$${itemRetail.toFixed(2)}`)}
                        </td>
                        <td className="px-5 py-4 font-medium">
                          {isEditing ? (
                            <div className="flex gap-1 items-center">$<input type="number" name="pricePaid" value={editFormData.pricePaid} onChange={handleEditChange} className="w-16 p-1.5 border rounded text-xs" title="Price" /></div>
                          ) : (`$${itemCost.toFixed(2)}`)}
                        </td>
                        <td className="px-5 py-4 font-bold text-emerald-600">${itemSavings > 0 ? itemSavings.toFixed(2) : '0.00'}</td>
                        <td className="px-5 py-4">
                           {isEditing ? (
                             <input type="number" name="wears" value={editFormData.wears} onChange={handleEditChange} className="w-16 p-1.5 border rounded text-xs" />
                           ) : (
                             <div className="flex items-center gap-2">
                               <span className="font-medium min-w-[20px] text-center">{wears}</span>
                               <button onClick={() => addWear(item.id)} className="bg-stone-200 hover:bg-emerald-100 hover:text-emerald-700 text-stone-600 rounded-full p-1 transition-colors" title="Add a wear"><Plus size={14} /></button>
                             </div>
                           )}
                        </td>
                        <td className="px-5 py-4 font-bold text-stone-800">${cpw.toFixed(2)}</td>
                        <td className="px-5 py-4 text-right">
                          {isEditing ? (
                            <div className="flex justify-end gap-2">
                              <button onClick={handleEditSave} className="p-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors" title="Save"><Check size={14} /></button>
                              <button onClick={() => setEditingId(null)} className="p-2 text-stone-600 bg-stone-200 hover:bg-stone-300 rounded transition-colors" title="Cancel"><X size={14} /></button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEditClick(item)} className="p-2 text-stone-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit"><Edit2 size={16} /></button>
                              <button onClick={() => deleteItem(item.id)} className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete"><Trash2 size={16} /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {}
        {/* =========================================
            TAB 2: BOLO WISHLIST
           ========================================= */}
        {activeTab === 'wishlist' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300 max-w-4xl mx-auto">
            
            <div className="bg-emerald-900 rounded-xl p-8 shadow-md text-white">
              <div className="flex items-center gap-3 mb-4">
                <Target size={28} className="text-emerald-400" />
                <h2 className="text-2xl font-bold tracking-tight">The BOLO List</h2>
              </div>
              <p className="text-emerald-100 font-medium mb-8 max-w-2xl">
                Be On the Look Out. Track your "White Whales"—the vintage grails and specific items you are hunting for. When you find one in the wild, tap "Found It" to instantly log the steal.
              </p>

              <form onSubmit={handleBoloSubmit} className="flex flex-col sm:flex-row gap-4 bg-emerald-950/50 p-4 rounded-xl border border-emerald-800/50 backdrop-blur-sm">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-emerald-400/80 mb-1.5 uppercase tracking-wide">Item I'm hunting for</label>
                  <input required type="text" value={boloData.name} onChange={e => setBoloData({...boloData, name: e.target.value})} className="w-full p-3 bg-white/10 border border-emerald-700/50 rounded-lg text-white placeholder-emerald-200/40 outline-none focus:border-emerald-400 transition-colors" placeholder="e.g. 90s Carhartt Detroit Jacket" />
                </div>
                <div className="w-full sm:w-48">
                  <label className="block text-xs font-semibold text-emerald-400/80 mb-1.5 uppercase tracking-wide">Max Willing to Pay ($)</label>
                  <input type="number" min="0" step="0.01" value={boloData.maxPrice} onChange={e => setBoloData({...boloData, maxPrice: e.target.value})} className="w-full p-3 bg-white/10 border border-emerald-700/50 rounded-lg text-white placeholder-emerald-200/40 outline-none focus:border-emerald-400 transition-colors" placeholder="0.00" />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                    <Crosshair size={18} /> Add Target
                  </button>
                </div>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wishlist.length === 0 ? (
                <div className="col-span-full py-16 text-center text-stone-500 bg-stone-100/50 rounded-xl border border-dashed border-stone-300">
                  <Target size={32} className="mx-auto mb-3 text-stone-300" />
                  <p>Your hunt list is empty.</p>
                </div>
              ) : (
                wishlist.map(item => (
                  <div key={item.id} className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between group hover:border-emerald-300 transition-colors">
                    <div>
                      <h3 className="font-bold text-stone-800 text-lg leading-tight mb-1">{item.name}</h3>
                      {item.maxPrice > 0 && (
                        <p className="text-sm text-stone-500 font-medium">
                          Target Max Price: <span className="text-amber-600 font-bold">${parseFloat(item.maxPrice).toFixed(2)}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button 
                        onClick={() => handleFoundBolo(item)}
                        className="flex-1 sm:flex-none bg-stone-900 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Check size={16} /> Found It!
                      </button>
                      <button 
                        onClick={() => deleteBolo(item.id)}
                        className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove from list"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {}
        {/* =========================================
            TAB 3: STORE EXPLORER (AI CURATED)
           ========================================= */}
        {activeTab === 'explore' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300 max-w-4xl mx-auto">
            
            <div className="bg-stone-900 rounded-xl overflow-hidden shadow-md relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
              
              <div className="p-8 sm:p-10 relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-emerald-500/20 p-2 rounded-lg border border-emerald-500/30">
                    <Sparkles className="text-emerald-400 w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">AI Sourcing Guide</h2>
                </div>
                
                <p className="text-stone-300 font-medium max-w-2xl text-lg leading-relaxed">
                  Based on your closet {topCategory ? <span className="text-emerald-300">(heavy on {topCategory})</span> : ''}, we've curated the best spots near <span className="text-white border-b border-stone-500">Bethany, OR</span> for your aesthetic.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {sortedStores.map(store => {
                const isTopMatch = store.matchCategories.includes(topCategory);
                
                return (
                <div key={store.id} className={`bg-white p-6 rounded-xl border shadow-sm transition-all hover:shadow-md ${isTopMatch ? 'border-emerald-300 ring-1 ring-emerald-50' : 'border-stone-200'}`}>
                  <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-stone-800">{store.name}</h3>
                        {isTopMatch && (
                           <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Top Match</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-stone-500 font-medium">
                        <span className="flex items-center gap-1"><Store size={14} /> {store.type}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-emerald-600"><Tag size={14} /> {store.price}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><MapPin size={14} /> {store.distance}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(store.query)}`, '_blank')}
                      className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 sm:w-auto w-full"
                    >
                      <Navigation size={16} /> Directions
                    </button>
                  </div>
                  
                  <div className="bg-stone-50/80 rounded-lg p-4 border border-stone-100">
                    <p className="text-sm text-stone-600 leading-relaxed">
                      <strong className="text-stone-800 font-semibold">Vibe Check:</strong> {store.vibe.replace('AI Vibe Match: ', '')}
                    </p>
                  </div>
                </div>
              )})}
            </div>
          </div>
        )}

      </main>

      {}
      {/* Spotify Wrapped Style IG Story Modal */}
      {isSharing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-[360px] aspect-[9/16] bg-gradient-to-b from-stone-900 via-emerald-950 to-stone-950 rounded-3xl overflow-hidden shadow-2xl border border-emerald-800/50 flex flex-col p-6 text-white animate-in zoom-in-95 duration-300">
            
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-emerald-500/20 p-1.5 rounded-lg border border-emerald-500/30">
                <Leaf className="text-emerald-400 w-4 h-4" />
              </div>
              <span className="text-white font-extrabold tracking-tight text-sm">ThriftTracker</span>
              <button onClick={() => setIsSharing(false)} className="ml-auto text-white/50 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="text-center mt-2 mb-6">
              <p className="text-emerald-400 font-bold tracking-widest uppercase text-[10px] mb-2">My Thrift Impact</p>
              <h2 className="text-6xl font-black text-white leading-none tracking-tighter">
                ${metrics.financialSaved.toFixed(0)}
              </h2>
              <p className="text-stone-300 font-medium mt-3 text-sm">Saved by shopping secondhand.</p>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex flex-col items-center justify-center text-center shadow-inner">
                <Bath className="text-blue-400 mb-1.5 w-6 h-6" />
                <p className="text-xl font-bold text-white leading-none">{Math.round(metrics.waterSaved / 40).toLocaleString()}</p>
                <p className="text-[8px] text-stone-400 font-bold uppercase tracking-wider mt-1">Bathtubs</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex flex-col items-center justify-center text-center shadow-inner">
                <Car className="text-stone-300 mb-1.5 w-6 h-6" />
                <p className="text-xl font-bold text-white leading-none">{Math.round(metrics.co2Avoided / 0.4).toLocaleString()}</p>
                <p className="text-[8px] text-stone-400 font-bold uppercase tracking-wider mt-1">Miles</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex flex-col items-center justify-center text-center shadow-inner">
                <Trash className="text-amber-200 mb-1.5 w-6 h-6" />
                <p className="text-xl font-bold text-white leading-none">{metrics.wasteDiverted.toFixed(1)}</p>
                <p className="text-[8px] text-stone-400 font-bold uppercase tracking-wider mt-1">Lbs Waste</p>
              </div>
            </div>

            <div className="bg-black/20 rounded-2xl p-4 border border-white/5 flex-1 flex flex-col">
              <h3 className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-widest mb-4 text-center">Top Steals</h3>
              <div className="space-y-4 flex-1 justify-center flex flex-col">
                {topSteals.length > 0 ? topSteals.map((item, i) => (
                  <div key={item.id} className="flex items-center gap-3">
                    
                    <div className="relative w-12 h-12 flex-shrink-0 bg-stone-800 rounded-xl flex items-center justify-center border border-white/10 overflow-hidden shadow-inner">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="font-black text-sm text-emerald-400/50 flex items-center justify-center w-full h-full bg-emerald-950/50">
                           <Shirt size={20}/>
                        </div>
                      )}
                      <div className="absolute -top-1 -left-1 bg-emerald-500 text-stone-900 text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-br-lg rounded-tl-xl">
                        {i + 1}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm leading-tight truncate text-white">{item.name}</p>
                      {item.brand && (
                        <p className="text-emerald-100/50 text-[10px] font-bold uppercase tracking-wider mt-0.5 truncate">{item.brand}</p>
                      )}
                    </div>
                    <div className="text-right">
                       <p className="text-emerald-400 text-sm font-black">
                        -${(item.retailPrice - (item.pricePaid + (item.shippingCost || 0))).toFixed(0)}
                      </p>
                    </div>
                  </div>
                )) : (
                  <p className="text-stone-500 italic text-xs text-center">Log items to see your steals!</p>
                )}
              </div>
            </div>

            <div className="text-center pt-4 mt-auto">
              <p className="text-emerald-500/50 font-bold tracking-widest text-[10px] uppercase">thrifttracker.app</p>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
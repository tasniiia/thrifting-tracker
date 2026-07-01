"use client";

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Trash2, Edit2, Check, X, ExternalLink, Leaf, Droplets, DollarSign, Shirt, Bath, Car, Trash, Info, Plus, Share2 } from 'lucide-react';

const ENVIRONMENTAL_CONSTANTS: Record<string, { water: number; co2: number; waste: number }> = {
  Tops: { water: 500, co2: 2, waste: 0.5 },
  Bottoms: { water: 1800, co2: 4, waste: 1.0 },
  Dresses: { water: 1200, co2: 3.5, waste: 1.2 },
  Outerwear: { water: 1000, co2: 5, waste: 2.0 },
  Footwear: { water: 500, co2: 3, waste: 1.0 },
  Home: { water: 300, co2: 2, waste: 2.0 }
};

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
}

export default function App() {
  const [items, setItems] = useState<ThriftItem[]>([]);
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
    productUrl: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('thriftedItems');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse items");
      }
    }
    if (!saved) {
      const mockData: ThriftItem[] = [
        { id: '1', name: '501 Original Jeans', brand: 'Levi', category: 'Bottoms', source: 'In-Store', storeName: 'Goodwill', pricePaid: 15, shippingCost: 0, retailPrice: 98, productUrl: '', wears: 5 },
        { id: '2', name: 'Synchilla Fleece', brand: 'Patagonia', category: 'Outerwear', source: 'In-Store', storeName: 'Local Consignment', pricePaid: 25, shippingCost: 0, retailPrice: 139, productUrl: '', wears: 2 },
        { id: '3', name: 'Linen Button Down', brand: 'Everlane', category: 'Tops', source: 'Online', storeName: 'Depop', pricePaid: 18, shippingCost: 6, retailPrice: 85, productUrl: 'https://depop.com/items/linen-shirt', wears: 0 }
      ];
      setItems(mockData);
      localStorage.setItem('thriftedItems', JSON.stringify(mockData));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('thriftedItems', JSON.stringify(items));
    }
  }, [items, isLoaded]);

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
    .map(item => {
      const cost = item.pricePaid + (item.shippingCost || 0);
      return { ...item, netSavings: item.retailPrice - cost };
    })
    .sort((a, b) => b.netSavings - a.netSavings)
    .slice(0, 3);

  const chartData = Object.values(items.reduce((acc: any, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { category: item.category, spent: 0, retail: 0 };
    }
    acc[item.category].spent += (item.pricePaid + (item.shippingCost || 0));
    acc[item.category].retail += item.retailPrice;
    return acc;
  }, {}));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSourceToggle = (newSource: string) => {
    setFormData(prev => ({ ...prev, source: newSource }));
  };

  const handleSubmit = (e: React.FormEvent) => {
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
    setFormData({ name: '', brand: '', category: 'Tops', source: formData.source, storeName: '', pricePaid: '', shippingCost: '', retailPrice: '', productUrl: '' });
  };

  const deleteItem = (id: string) => setItems(items.filter(item => item.id !== id));
  const addWear = (id: string) => setItems(items.map(item => item.id === id ? { ...item, wears: (item.wears || 0) + 1 } : item));

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-stone-50 text-slate-800 font-sans pb-12">
      <header className="bg-white border-b border-stone-200 py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-stone-800">ThriftTracker</h1>
          <button onClick={() => setIsSharing(true)} className="bg-stone-900 text-white px-4 py-2 rounded-full font-medium text-sm">Share Impact</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8 pt-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-stone-200"><p className="text-sm text-stone-500">Total Saved</p><p className="text-2xl font-bold">${metrics.financialSaved.toFixed(2)}</p></div>
          <div className="bg-white p-5 rounded-xl border border-stone-200"><p className="text-sm text-stone-500">CO2 Avoided</p><p className="text-2xl font-bold">{metrics.co2Avoided.toFixed(1)} kg</p></div>
          <div className="bg-white p-5 rounded-xl border border-stone-200"><p className="text-sm text-stone-500">Items</p><p className="text-2xl font-bold">{items.length}</p></div>
          <div className="bg-white p-5 rounded-xl border border-stone-200"><p className="text-sm text-stone-500">Avg CPW</p><p className="text-2xl font-bold">${avgCpw.toFixed(2)}</p></div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-stone-200">
           <h2 className="text-lg font-bold mb-4">Inventory</h2>
           {items.map(item => (
             <div key={item.id} className="flex justify-between items-center py-3 border-b">
               <span>{item.name}</span>
               <div className="flex gap-4">
                 <button onClick={() => addWear(item.id)} className="text-emerald-600 font-bold">+ Wear</button>
                 <button onClick={() => deleteItem(item.id)} className="text-red-500">Delete</button>
               </div>
             </div>
           ))}
        </div>
      </main>
    </div>
  );
}
"use client";

import React, { useState, useEffect } from 'react';

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
  // Explicitly typing the state array as ThriftItem[] prevents the "never[]" error
  const [items, setItems] = useState<ThriftItem[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem('thriftedItems');
    if (saved) {
      try {
        setItems(JSON.parse(saved) as ThriftItem[]);
      } catch (e) {
        setItems([]);
      }
    } else {
      setItems([]);
    }
    setIsLoaded(true);
  }, []);

  if (!isLoaded) return null;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">ThriftTracker</h1>
      <div className="mt-4">
        {items.map((item: ThriftItem) => (
          <div key={item.id} className="border-b py-2">{item.name}</div>
        ))}
      </div>
    </div>
  );
}
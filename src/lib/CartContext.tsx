'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Drink } from './data';

export type CartItem = {
  drink: Drink;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (drink: Drink) => void;
  removeFromCart: (name: string) => void;
  updateQty: (name: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cc_cart');
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('cc_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (drink: Drink) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.drink.name === drink.name);
      if (existing) return prev.map((i) => i.drink.name === drink.name ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { drink, quantity: 1 }];
    });
    setIsOpen(true);
  };

  const removeFromCart = (name: string) => setItems((prev) => prev.filter((i) => i.drink.name !== name));

  const updateQty = (name: string, qty: number) => {
    if (qty <= 0) { removeFromCart(name); return; }
    setItems((prev) => prev.map((i) => i.drink.name === name ? { ...i, quantity: qty } : i));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.drink.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, totalItems, totalPrice, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
}

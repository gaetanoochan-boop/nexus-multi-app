import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';

interface CartItem {
  productId: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (productId: string) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'carts', user.uid), (doc) => {
      if (doc.exists()) {
        setItems(doc.data().items || []);
      }
    });

    return unsubscribe;
  }, [user]);

  const updateCart = async (newItems: CartItem[]) => {
    if (!user) return;
    await setDoc(doc(db, 'carts', user.uid), { items: newItems, updatedAt: new Date().toISOString() });
  };

  const addToCart = async (productId: string) => {
    const existingIndex = items.findIndex(item => item.productId === productId);
    let newItems;
    if (existingIndex > -1) {
      newItems = [...items];
      newItems[existingIndex].quantity += 1;
    } else {
      newItems = [...items, { productId, quantity: 1 }];
    }
    await updateCart(newItems);
  };

  const removeFromCart = async (productId: string) => {
    const newItems = items.filter(item => item.productId !== productId);
    await updateCart(newItems);
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(productId);
    const newItems = items.map(item => item.productId === productId ? { ...item, quantity } : item);
    await updateCart(newItems);
  };

  const clearCart = async () => {
    await updateCart([]);
  };

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

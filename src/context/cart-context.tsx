
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { CartItem, Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Load cart from localStorage on initial client-side render
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('cartItems');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      // Only run on client
      if (typeof window !== 'undefined') {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
      }
    } catch (error) {
      console.error("Failed to save cart to localStorage", error);
    }
  }, [cartItems]);

  const addToCart = (product: Product, quantity: number) => {
    const stockLimit = product.stock ?? 999;
    const existingItem = cartItems.find(item => item.product.id === product.id);
    const currentQty = existingItem ? existingItem.quantity : 0;
    const newQty = currentQty + quantity;

    if (newQty > stockLimit) {
      toast({
        title: "Stock limit reached",
        description: `Only ${stockLimit} units available. We've adjusted your cart to the maximum available stock.`,
        variant: "destructive"
      });
      if (existingItem) {
        setCartItems(prev => prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: stockLimit } : item
        ));
      } else {
        setCartItems(prev => [...prev, { product, quantity: stockLimit }]);
      }
      return;
    }

    if (existingItem) {
      toast({ title: "Cart updated", description: `Added ${quantity} more of ${product.name}.` });
      setCartItems(prev => prev.map(item =>
        item.product.id === product.id ? { ...item, quantity: newQty } : item
      ));
    } else {
      toast({ title: "Item added to cart", description: `${quantity} x ${product.name}` });
      setCartItems(prev => [...prev, { product, quantity }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
    toast({
      title: "Item removed from cart",
      variant: "destructive",
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const item = cartItems.find(i => i.product.id === productId);
    const stockLimit = item?.product.stock ?? 999;

    if (quantity <= 0) {
      removeFromCart(productId);
    } else if (quantity > stockLimit) {
        toast({
            title: "Insufficient stock",
            description: `Only ${stockLimit} units of ${item?.product.name} are available.`,
            variant: "destructive"
        });
        setCartItems(prevItems =>
            prevItems.map(item =>
              item.product.id === productId ? { ...item, quantity: stockLimit } : item
            )
        );
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

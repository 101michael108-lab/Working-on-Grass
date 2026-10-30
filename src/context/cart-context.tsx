
"use client";

import React, { createContext, useCallback, useContext, useRef, useState, ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import type { CartItem, Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useFirestore } from '@/firebase';
import { toGaItem, track, countFunnelStep } from '@/lib/analytics';
import { getUnitPrice } from '@/lib/pricing';
import { formatRand } from '@/lib/utils';

/** Gives every "added to cart" toast a direct next step. */
const checkoutAction = (
  <ToastAction asChild altText="Go to checkout" className="border-forest bg-forest font-semibold text-ondark-bright hover:bg-forest-dark">
    <Link href="/checkout">Checkout →</Link>
  </ToastAction>
);

interface CartContextType {
  cartItems: CartItem[];
  /** False until the cart has been restored from localStorage on the client. */
  isHydrated: boolean;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  /** Re-read every line's product from Firestore (price, sale, stock). See useLiveCart. */
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  // Latest cart for refreshCart, so it can stay referentially stable.
  const cartItemsRef = useRef(cartItems);
  cartItemsRef.current = cartItems;

  // Load cart from localStorage on initial client-side render
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('cartItems');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
    } finally {
      setIsHydrated(true);
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

    const addedQty = Math.max(0, Math.min(newQty, stockLimit) - currentQty);
    if (addedQty > 0) {
      countFunnelStep('add_to_cart');
    track('add_to_cart', {
        currency: 'ZAR',
        value: getUnitPrice(product) * addedQty,
        items: [toGaItem(product, addedQty)],
      });
    }

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
      toast({ title: "Cart updated", description: `Added ${quantity} more of ${product.name}.`, action: checkoutAction });
      setCartItems(prev => prev.map(item =>
        item.product.id === product.id ? { ...item, quantity: newQty } : item
      ));
    } else {
      toast({ title: "Item added to cart", description: `${quantity} x ${product.name}`, action: checkoutAction });
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

  /**
   * The cart stores a product snapshot from add-to-cart time, but checkout
   * charges live Firestore prices. Re-read each line so the totals shown match
   * what PayFast will charge (e.g. after a sale starts or ends) and quantities
   * respect current stock.
   */
  const refreshCart = useCallback(async () => {
    const items = cartItemsRef.current;
    if (items.length === 0) return;

    let live: Map<string, Product | null>;
    try {
      const snaps = await Promise.all(items.map((i) => getDoc(doc(firestore, 'products', i.product.id))));
      live = new Map(snaps.map((s) => [s.id, s.exists() ? ({ ...s.data(), id: s.id } as Product) : null]));
    } catch (error) {
      // Offline or blocked: keep the snapshot; the server re-prices at checkout anyway.
      console.error('Failed to refresh cart prices', error);
      return;
    }

    const notes: string[] = [];
    for (const { product, quantity } of items) {
      const fresh = live.get(product.id);
      if (fresh === null) {
        notes.push(`"${product.name}" is no longer available and was removed.`);
        continue;
      }
      if (!fresh) continue;
      const stock = fresh.stock ?? 999;
      if (stock <= 0) {
        notes.push(`"${fresh.name}" is sold out and was removed.`);
        continue;
      }
      if (quantity > stock) notes.push(`Only ${stock} of "${fresh.name}" left, so we updated your quantity.`);
      const was = getUnitPrice(product);
      const now = getUnitPrice(fresh);
      if (now !== was) notes.push(`"${fresh.name}" is now ${formatRand(now)} (was ${formatRand(was)}).`);
    }

    setCartItems((prev) =>
      prev.flatMap((item) => {
        // Lines added while the reads were in flight are already fresh.
        if (!live.has(item.product.id)) return [item];
        const fresh = live.get(item.product.id);
        const stock = fresh?.stock ?? 999;
        if (!fresh || stock <= 0) return [];
        return [{ product: fresh, quantity: Math.min(item.quantity, stock) }];
      })
    );

    if (notes.length) toast({ title: 'Your cart was updated', description: notes.join(' ') });
  }, [firestore, toast]);

  return (
    <CartContext.Provider value={{ cartItems, isHydrated, addToCart, removeFromCart, updateQuantity, clearCart, refreshCart }}>
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

/**
 * useCart for pages that show totals (cart, checkout): refreshes every line
 * from Firestore once the cart is restored. Kept off other pages so browsing
 * the site costs no extra reads.
 */
export const useLiveCart = () => {
  const cart = useCart();
  const { isHydrated, refreshCart } = cart;
  useEffect(() => {
    if (isHydrated) void refreshCart();
  }, [isHydrated, refreshCart]);
  return cart;
};

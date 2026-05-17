'use client';

import { create } from 'zustand';
import { cartAPI } from '@/lib/api';
import { Cart, CartItem } from '@/types';

interface CartState {
  cart: Cart | null;
  items: CartItem[];
  loading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  items: [],
  loading: false,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const response = await cartAPI.get();
      set({ cart: response.data, items: response.data.items || [] });
    } catch {
      set({ cart: null, items: [] });
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (productId: number, quantity: number) => {
    try {
      const response = await cartAPI.addItem(productId, quantity);
      set({ cart: response.data, items: response.data.items || [] });
    } catch {
      throw new Error('Failed to add item to cart');
    }
  },

  updateItem: async (itemId: number, quantity: number) => {
    await cartAPI.updateItem(itemId, quantity);
    await get().fetchCart();
  },

  removeItem: async (itemId: number) => {
    await cartAPI.removeItem(itemId);
    await get().fetchCart();
  },

  clearCart: async () => {
    await cartAPI.clear();
    set({ cart: null, items: [] });
  },

  getTotal: () => {
    return get().items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
  },

  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
}));

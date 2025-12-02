import { create } from 'zustand';
import { db } from '@/db';
import type { Order, NewOrder } from '@/db/types';
import { generateId } from '@/lib/utils';

interface OrderState {
  orders: Order[];
  isLoading: boolean;

  // Actions
  loadOrdersForSession: (sessionId: string) => Promise<void>;
  addOrder: (order: NewOrder) => Promise<Order>;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  getOrderCount: (sessionId: string) => number;
  clearOrders: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  isLoading: false,

  loadOrdersForSession: async (sessionId) => {
    set({ isLoading: true });
    const orders = await db.orders
      .where('sessionId')
      .equals(sessionId)
      .reverse()
      .sortBy('timestamp');
    set({ orders: orders.reverse(), isLoading: false });
  },

  addOrder: async (order) => {
    const newOrder: Order = {
      ...order,
      id: generateId(),
      timestamp: Date.now(),
    };
    await db.orders.add(newOrder);
    set((state) => ({ orders: [...state.orders, newOrder] }));
    return newOrder;
  },

  updateOrder: async (id, updates) => {
    await db.orders.update(id, updates);
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === id ? { ...order, ...updates } : order
      ),
    }));
  },

  deleteOrder: async (id) => {
    await db.orders.delete(id);
    set((state) => ({
      orders: state.orders.filter((order) => order.id !== id),
    }));
  },

  getOrderCount: (sessionId) => {
    return get().orders.filter((o) => o.sessionId === sessionId).length;
  },

  clearOrders: () => {
    set({ orders: [] });
  },
}));

// Helper to get order count directly from DB (for session lists)
export async function getOrderCountForSession(sessionId: string): Promise<number> {
  return db.orders.where('sessionId').equals(sessionId).count();
}


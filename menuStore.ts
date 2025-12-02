import { create } from 'zustand';
import { db } from '@/db';
import type { MenuItem, CustomizationOption, NewMenuItem, NewCustomizationOption, MenuSnapshot } from '@/db/types';
import { generateId } from '@/lib/utils';

interface MenuState {
  items: MenuItem[];
  customizations: CustomizationOption[];
  isLoading: boolean;
  
  // Actions
  loadMenu: () => Promise<void>;
  addItem: (item: NewMenuItem) => Promise<MenuItem>;
  updateItem: (id: string, updates: Partial<MenuItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  addCustomization: (option: NewCustomizationOption) => Promise<CustomizationOption>;
  updateCustomization: (id: string, updates: Partial<CustomizationOption>) => Promise<void>;
  deleteCustomization: (id: string) => Promise<void>;
  getSnapshot: () => MenuSnapshot;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  items: [],
  customizations: [],
  isLoading: true,

  loadMenu: async () => {
    set({ isLoading: true });
    const [items, customizations] = await Promise.all([
      db.menuItems.toArray(),
      db.customizations.toArray(),
    ]);
    set({ items, customizations, isLoading: false });
  },

  addItem: async (item) => {
    const now = Date.now();
    const newItem: MenuItem = {
      ...item,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    await db.menuItems.add(newItem);
    set((state) => ({ items: [...state.items, newItem] }));
    return newItem;
  },

  updateItem: async (id, updates) => {
    const updatedFields = { ...updates, updatedAt: Date.now() };
    await db.menuItems.update(id, updatedFields);
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updatedFields } : item
      ),
    }));
  },

  deleteItem: async (id) => {
    await db.menuItems.delete(id);
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  addCustomization: async (option) => {
    const newOption: CustomizationOption = {
      ...option,
      id: generateId(),
    };
    await db.customizations.add(newOption);
    set((state) => ({
      customizations: [...state.customizations, newOption],
    }));
    return newOption;
  },

  updateCustomization: async (id, updates) => {
    await db.customizations.update(id, updates);
    set((state) => ({
      customizations: state.customizations.map((opt) =>
        opt.id === id ? { ...opt, ...updates } : opt
      ),
    }));
  },

  deleteCustomization: async (id) => {
    await db.customizations.delete(id);
    set((state) => ({
      customizations: state.customizations.filter((opt) => opt.id !== id),
    }));
  },

  getSnapshot: () => {
    const { items, customizations } = get();
    return {
      items: items.filter((item) => item.available),
      customizations: customizations.filter((opt) => opt.available),
    };
  },
}));

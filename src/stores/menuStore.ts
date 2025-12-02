import { create } from 'zustand';
import { db } from '@/db';
import type { MenuItem, ModifierGroup, NewMenuItem, NewModifierGroup, MenuSnapshot } from '@/db/types';
import { generateId } from '@/lib/utils';

interface MenuState {
  items: MenuItem[];
  modifierGroups: ModifierGroup[];
  isLoading: boolean;

  // Menu item actions
  loadMenu: () => Promise<void>;
  addItem: (item: NewMenuItem) => Promise<MenuItem>;
  updateItem: (id: string, updates: Partial<MenuItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;

  // Modifier group actions
  addModifierGroup: (group: NewModifierGroup) => Promise<ModifierGroup>;
  updateModifierGroup: (id: string, updates: Partial<ModifierGroup>) => Promise<void>;
  deleteModifierGroup: (id: string) => Promise<void>;

  // Snapshot for sessions
  getSnapshot: () => MenuSnapshot;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  items: [],
  modifierGroups: [],
  isLoading: true,

  loadMenu: async () => {
    set({ isLoading: true });
    const [items, modifierGroups] = await Promise.all([
      db.menuItems.toArray(),
      db.modifierGroups.toArray(),
    ]);
    set({ items, modifierGroups, isLoading: false });
  },

  addItem: async (item) => {
    const now = Date.now();
    const newItem: MenuItem = {
      ...item,
      id: generateId(),
      modifierGroupIds: item.modifierGroupIds || [],
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

  addModifierGroup: async (group) => {
    const now = Date.now();
    const newGroup: ModifierGroup = {
      ...group,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    await db.modifierGroups.add(newGroup);
    set((state) => ({
      modifierGroups: [...state.modifierGroups, newGroup],
    }));
    return newGroup;
  },

  updateModifierGroup: async (id, updates) => {
    const updatedFields = { ...updates, updatedAt: Date.now() };
    await db.modifierGroups.update(id, updatedFields);
    set((state) => ({
      modifierGroups: state.modifierGroups.map((group) =>
        group.id === id ? { ...group, ...updatedFields } : group
      ),
    }));
  },

  deleteModifierGroup: async (id) => {
    // Also remove this group from any menu items that reference it
    const { items } = get();
    const affectedItems = items.filter((item) => item.modifierGroupIds.includes(id));

    await Promise.all([
      db.modifierGroups.delete(id),
      ...affectedItems.map((item) =>
        db.menuItems.update(item.id, {
          modifierGroupIds: item.modifierGroupIds.filter((gid) => gid !== id),
          updatedAt: Date.now(),
        })
      ),
    ]);

    set((state) => ({
      modifierGroups: state.modifierGroups.filter((group) => group.id !== id),
      items: state.items.map((item) =>
        item.modifierGroupIds.includes(id)
          ? { ...item, modifierGroupIds: item.modifierGroupIds.filter((gid) => gid !== id) }
          : item
      ),
    }));
  },

  getSnapshot: () => {
    const { items, modifierGroups } = get();
    return {
      items: items.filter((item) => item.available),
      modifierGroups: modifierGroups
        .filter((group) => group.available)
        .map((group) => ({
          ...group,
          options: group.options.filter((opt) => opt.available),
        })),
    };
  },
}));


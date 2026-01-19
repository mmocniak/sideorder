import { create } from 'zustand';
import { db } from '@/db';
import type { MenuItem, ModifierGroup, Category, NewMenuItem, NewModifierGroup, NewCategory, MenuSnapshot } from '@/db/types';
import { generateId } from '@/lib/utils';

interface MenuState {
  items: MenuItem[];
  modifierGroups: ModifierGroup[];
  categories: Category[];
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

  // Category actions
  addCategory: (category: NewCategory) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Reorder actions
  reorderItems: (categoryId: string, itemIds: string[]) => Promise<void>;
  reorderModifierGroups: (groupIds: string[]) => Promise<void>;
  reorderCategories: (categoryIds: string[]) => Promise<void>;

  // Snapshot for sessions
  getSnapshot: () => MenuSnapshot;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  items: [],
  modifierGroups: [],
  categories: [],
  isLoading: true,

  loadMenu: async () => {
    set({ isLoading: true });
    const [items, modifierGroups, categories] = await Promise.all([
      db.menuItems.toArray(),
      db.modifierGroups.toArray(),
      db.categories.toArray(),
    ]);
    // Sort all by sortOrder
    items.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    modifierGroups.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    categories.sort((a, b) => a.sortOrder - b.sortOrder);
    set({ items, modifierGroups, categories, isLoading: false });
  },

  addItem: async (item) => {
    const now = Date.now();
    const { items } = get();
    // Calculate sortOrder for new item (max in category + 1)
    const categoryItems = items.filter(i => i.categoryId === item.categoryId);
    const maxSortOrder = categoryItems.length > 0
      ? Math.max(...categoryItems.map(i => i.sortOrder ?? 0))
      : -1;

    const newItem: MenuItem = {
      ...item,
      id: generateId(),
      modifierGroupIds: item.modifierGroupIds || [],
      sortOrder: item.sortOrder ?? maxSortOrder + 1,
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
    const { modifierGroups } = get();
    // Calculate sortOrder for new group (max + 1)
    const maxSortOrder = modifierGroups.length > 0
      ? Math.max(...modifierGroups.map(g => g.sortOrder ?? 0))
      : -1;

    const newGroup: ModifierGroup = {
      ...group,
      id: generateId(),
      sortOrder: group.sortOrder ?? maxSortOrder + 1,
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

  addCategory: async (category) => {
    const now = Date.now();
    const { categories } = get();
    const maxSortOrder = categories.length > 0
      ? Math.max(...categories.map(c => c.sortOrder))
      : -1;

    const newCategory: Category = {
      ...category,
      id: generateId(),
      sortOrder: category.sortOrder ?? maxSortOrder + 1,
      createdAt: now,
      updatedAt: now,
    };
    await db.categories.add(newCategory);
    set((state) => ({
      categories: [...state.categories, newCategory].sort((a, b) => a.sortOrder - b.sortOrder),
    }));
    return newCategory;
  },

  updateCategory: async (id, updates) => {
    const updatedFields = { ...updates, updatedAt: Date.now() };
    await db.categories.update(id, updatedFields);
    set((state) => ({
      categories: state.categories
        .map((cat) => cat.id === id ? { ...cat, ...updatedFields } : cat)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    }));
  },

  deleteCategory: async (id) => {
    // Move items in this category to "Other" (or first available category)
    const { items, categories } = get();
    const affectedItems = items.filter((item) => item.categoryId === id);
    const fallbackCategory = categories.find(c => c.id !== id && c.available) || categories.find(c => c.id !== id);

    if (fallbackCategory && affectedItems.length > 0) {
      await Promise.all([
        db.categories.delete(id),
        ...affectedItems.map((item) =>
          db.menuItems.update(item.id, {
            categoryId: fallbackCategory.id,
            updatedAt: Date.now(),
          })
        ),
      ]);

      set((state) => ({
        categories: state.categories.filter((cat) => cat.id !== id),
        items: state.items.map((item) =>
          item.categoryId === id
            ? { ...item, categoryId: fallbackCategory.id }
            : item
        ),
      }));
    } else {
      await db.categories.delete(id);
      set((state) => ({
        categories: state.categories.filter((cat) => cat.id !== id),
      }));
    }
  },

  reorderItems: async (categoryId, itemIds) => {
    const now = Date.now();
    // Update sortOrder for each item in the new order
    const updates = itemIds.map((id, index) => ({
      id,
      sortOrder: index,
      updatedAt: now,
    }));

    // Persist to database
    await Promise.all(
      updates.map(({ id, sortOrder, updatedAt }) =>
        db.menuItems.update(id, { sortOrder, updatedAt })
      )
    );

    // Update local state
    set((state) => ({
      items: state.items
        .map((item) => {
          if (item.categoryId !== categoryId) return item;
          const update = updates.find((u) => u.id === item.id);
          return update ? { ...item, sortOrder: update.sortOrder, updatedAt: update.updatedAt } : item;
        })
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    }));
  },

  reorderModifierGroups: async (groupIds) => {
    const now = Date.now();
    // Update sortOrder for each group in the new order
    const updates = groupIds.map((id, index) => ({
      id,
      sortOrder: index,
      updatedAt: now,
    }));

    // Persist to database
    await Promise.all(
      updates.map(({ id, sortOrder, updatedAt }) =>
        db.modifierGroups.update(id, { sortOrder, updatedAt })
      )
    );

    // Update local state
    set((state) => ({
      modifierGroups: state.modifierGroups
        .map((group) => {
          const update = updates.find((u) => u.id === group.id);
          return update ? { ...group, sortOrder: update.sortOrder, updatedAt: update.updatedAt } : group;
        })
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    }));
  },

  reorderCategories: async (categoryIds) => {
    const now = Date.now();
    // Update sortOrder for each category in the new order
    const updates = categoryIds.map((id, index) => ({
      id,
      sortOrder: index,
      updatedAt: now,
    }));

    // Persist to database
    await Promise.all(
      updates.map(({ id, sortOrder, updatedAt }) =>
        db.categories.update(id, { sortOrder, updatedAt })
      )
    );

    // Update local state
    set((state) => ({
      categories: state.categories
        .map((cat) => {
          const update = updates.find((u) => u.id === cat.id);
          return update ? { ...cat, sortOrder: update.sortOrder, updatedAt: update.updatedAt } : cat;
        })
        .sort((a, b) => a.sortOrder - b.sortOrder),
    }));
  },

  getSnapshot: () => {
    const { items, modifierGroups, categories } = get();
    return {
      items: items.filter((item) => item.available),
      modifierGroups: modifierGroups
        .filter((group) => group.available)
        .map((group) => ({
          ...group,
          options: group.options.filter((opt) => opt.available),
        })),
      categories: categories.filter((cat) => cat.available),
    };
  },
}));


import Dexie, { type EntityTable } from 'dexie';
import type { MenuItem, CustomizationOption, Session, Order, ModifierGroup, Category, Setting } from './types';

const db = new Dexie('SideOrderDB') as Dexie & {
  menuItems: EntityTable<MenuItem, 'id'>;
  customizations: EntityTable<CustomizationOption, 'id'>; // Legacy, kept for migration
  modifierGroups: EntityTable<ModifierGroup, 'id'>;
  categories: EntityTable<Category, 'id'>;
  settings: EntityTable<Setting, 'key'>;
  sessions: EntityTable<Session, 'id'>;
  orders: EntityTable<Order, 'id'>;
};

// Version 1: Original schema
db.version(1).stores({
  menuItems: 'id, name, category, available, createdAt',
  customizations: 'id, category, name, available',
  sessions: 'id, status, startedAt, endedAt',
  orders: 'id, sessionId, timestamp',
});

// Version 2: Add modifierGroups, menuItems now have modifierGroupIds
db.version(2).stores({
  menuItems: 'id, name, category, available, createdAt',
  customizations: 'id, category, name, available', // Keep for backward compat
  modifierGroups: 'id, name, available, createdAt',
  sessions: 'id, status, startedAt, endedAt',
  orders: 'id, sessionId, timestamp',
}).upgrade(tx => {
  // Add modifierGroupIds to existing menu items (empty array initially)
  return tx.table('menuItems').toCollection().modify(item => {
    if (!item.modifierGroupIds) {
      item.modifierGroupIds = [];
    }
  });
});

// Default category IDs for reference
const CAT_ESPRESSO = 'cat-espresso';
const CAT_DRIP = 'cat-drip';
const CAT_TEA = 'cat-tea';
const CAT_OTHER = 'cat-other';

// Version 3: Add categories table, menuItems use categoryId instead of category string
db.version(3).stores({
  menuItems: 'id, name, categoryId, available, createdAt',
  customizations: 'id, category, name, available',
  modifierGroups: 'id, name, available, createdAt',
  categories: 'id, name, sortOrder, available, createdAt',
  sessions: 'id, status, startedAt, endedAt',
  orders: 'id, sessionId, timestamp',
}).upgrade(async tx => {
  const now = Date.now();

  // Create category mapping from old string values to new IDs
  const categoryMap: Record<string, string> = {
    'espresso': CAT_ESPRESSO,
    'drip': CAT_DRIP,
    'tea': CAT_TEA,
    'other': CAT_OTHER,
  };

  // Create default categories
  const defaultCategories = [
    { id: CAT_ESPRESSO, name: 'Espresso', sortOrder: 0, available: true, createdAt: now, updatedAt: now },
    { id: CAT_DRIP, name: 'Drip', sortOrder: 1, available: true, createdAt: now, updatedAt: now },
    { id: CAT_TEA, name: 'Tea', sortOrder: 2, available: true, createdAt: now, updatedAt: now },
    { id: CAT_OTHER, name: 'Other', sortOrder: 3, available: true, createdAt: now, updatedAt: now },
  ];

  await tx.table('categories').bulkAdd(defaultCategories);

  // Migrate menu items to use categoryId
  await tx.table('menuItems').toCollection().modify(item => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const oldCategory = (item as any).category;
    if (oldCategory && typeof oldCategory === 'string') {
      item.categoryId = categoryMap[oldCategory] || CAT_OTHER;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (item as any).category;
    }
  });
});

// Version 4: Add settings table for app preferences
db.version(4).stores({
  menuItems: 'id, name, categoryId, available, createdAt',
  customizations: 'id, category, name, available',
  modifierGroups: 'id, name, available, createdAt',
  categories: 'id, name, sortOrder, available, createdAt',
  settings: 'key',
  sessions: 'id, status, startedAt, endedAt',
  orders: 'id, sessionId, timestamp',
});

// Default modifier group IDs for reference
const GROUP_SIZE = 'group-size';
const GROUP_MILK = 'group-milk';
const GROUP_SYRUPS = 'group-syrups';
const GROUP_TEMP = 'group-temp';

// Seed default modifier groups if none exist
export async function seedDefaultModifierGroups() {
  const count = await db.modifierGroups.count();
  if (count === 0) {
    const now = Date.now();
    await db.modifierGroups.bulkAdd([
      {
        id: GROUP_SIZE,
        name: 'Size',
        options: [
          { id: 'size-small', name: 'Small (8oz)', available: true },
          { id: 'size-regular', name: 'Regular (12oz)', available: true },
          { id: 'size-large', name: 'Large (16oz)', available: true },
        ],
        multiSelect: false,
        required: true,
        available: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: GROUP_MILK,
        name: 'Milk',
        options: [
          { id: 'milk-whole', name: 'Whole', available: true },
          { id: 'milk-oat', name: 'Oat', available: true },
          { id: 'milk-almond', name: 'Almond', available: true },
        ],
        multiSelect: false,
        required: true,
        available: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: GROUP_SYRUPS,
        name: 'Flavor Syrups',
        options: [
          { id: 'syrup-vanilla', name: 'Vanilla', available: true },
          { id: 'syrup-caramel', name: 'Caramel', available: true },
          { id: 'syrup-hazelnut', name: 'Hazelnut', available: true },
        ],
        multiSelect: true,
        required: false,
        available: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: GROUP_TEMP,
        name: 'Temperature',
        options: [
          { id: 'temp-hot', name: 'Hot', available: true },
          { id: 'temp-iced', name: 'Iced', available: true },
        ],
        multiSelect: false,
        required: false,
        available: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  }
}

// Seed default categories if none exist
export async function seedDefaultCategories() {
  const count = await db.categories.count();
  if (count === 0) {
    const now = Date.now();
    await db.categories.bulkAdd([
      { id: CAT_ESPRESSO, name: 'Espresso', sortOrder: 0, available: true, createdAt: now, updatedAt: now },
      { id: CAT_DRIP, name: 'Drip', sortOrder: 1, available: true, createdAt: now, updatedAt: now },
      { id: CAT_TEA, name: 'Tea', sortOrder: 2, available: true, createdAt: now, updatedAt: now },
      { id: CAT_OTHER, name: 'Other', sortOrder: 3, available: true, createdAt: now, updatedAt: now },
    ]);
  }
}

// Seed a few default menu items if none exist
export async function seedDefaultMenuItems() {
  const count = await db.menuItems.count();
  if (count === 0) {
    const now = Date.now();
    await db.menuItems.bulkAdd([
      // Espresso - no modifiers (simple shot)
      { id: 'item-espresso', name: 'Espresso', categoryId: CAT_ESPRESSO, modifierGroupIds: [], available: true, createdAt: now, updatedAt: now },
      // Americano - size + temp
      { id: 'item-americano', name: 'Americano', categoryId: CAT_ESPRESSO, modifierGroupIds: [GROUP_SIZE, GROUP_TEMP], available: true, createdAt: now, updatedAt: now },
      // Milk-based espresso drinks - size + milk + temp
      { id: 'item-latte', name: 'Latte', categoryId: CAT_ESPRESSO, modifierGroupIds: [GROUP_SIZE, GROUP_MILK, GROUP_TEMP], available: true, createdAt: now, updatedAt: now },
      { id: 'item-cappuccino', name: 'Cappuccino', categoryId: CAT_ESPRESSO, modifierGroupIds: [GROUP_SIZE, GROUP_MILK, GROUP_TEMP], available: true, createdAt: now, updatedAt: now },
      { id: 'item-mocha', name: 'Mocha', categoryId: CAT_ESPRESSO, modifierGroupIds: [GROUP_SIZE, GROUP_MILK, GROUP_TEMP], available: true, createdAt: now, updatedAt: now },
      // Drip - size + temp
      { id: 'item-drip', name: 'Drip Coffee', categoryId: CAT_DRIP, modifierGroupIds: [GROUP_SIZE, GROUP_TEMP], available: true, createdAt: now, updatedAt: now },
      // Pour over - temp only (typically single serve)
      { id: 'item-pourover', name: 'Pour Over', categoryId: CAT_DRIP, modifierGroupIds: [GROUP_TEMP], available: true, createdAt: now, updatedAt: now },
      // Tea - size + temp
      { id: 'item-tea', name: 'Hot Tea', categoryId: CAT_TEA, modifierGroupIds: [GROUP_SIZE, GROUP_TEMP], available: true, createdAt: now, updatedAt: now },
      // Matcha - size + milk + temp
      { id: 'item-matcha', name: 'Matcha Latte', categoryId: CAT_TEA, modifierGroupIds: [GROUP_SIZE, GROUP_MILK, GROUP_TEMP], available: true, createdAt: now, updatedAt: now },
    ]);
  }
}

// Migration: Add Temp modifier group if missing (for existing installs)
async function migrateTempModifierGroup() {
  const tempGroup = await db.modifierGroups.get(GROUP_TEMP);
  if (!tempGroup) {
    const now = Date.now();
    await db.modifierGroups.add({
      id: GROUP_TEMP,
      name: 'Temp',
      options: [
        { id: 'temp-hot', name: 'Hot', available: true },
        { id: 'temp-iced', name: 'Iced', available: true },
      ],
      multiSelect: false,
      required: false,
      available: true,
      createdAt: now,
      updatedAt: now,
    });

    // Add Temp to default menu items that should have it
    const itemsToUpdate = [
      'item-americano',
      'item-latte',
      'item-cappuccino',
      'item-mocha',
      'item-drip',
      'item-pourover',
      'item-tea',
      'item-matcha',
    ];

    for (const itemId of itemsToUpdate) {
      const item = await db.menuItems.get(itemId);
      if (item && !item.modifierGroupIds.includes(GROUP_TEMP)) {
        await db.menuItems.update(itemId, {
          modifierGroupIds: [...item.modifierGroupIds, GROUP_TEMP],
          updatedAt: now,
        });
      }
    }
  }
}

export async function initializeDatabase() {
  await seedDefaultCategories();
  await seedDefaultModifierGroups();
  await seedDefaultMenuItems();
  await migrateTempModifierGroup();
}

export { db };


import Dexie, { type EntityTable } from 'dexie';
import type { MenuItem, CustomizationOption, Session, Order, ModifierGroup } from './types';

const db = new Dexie('SideOrderDB') as Dexie & {
  menuItems: EntityTable<MenuItem, 'id'>;
  customizations: EntityTable<CustomizationOption, 'id'>; // Legacy, kept for migration
  modifierGroups: EntityTable<ModifierGroup, 'id'>;
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
      },
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
      { id: 'item-espresso', name: 'Espresso', category: 'espresso', modifierGroupIds: [], available: true, createdAt: now, updatedAt: now },
      // Americano - size + temp
      { id: 'item-americano', name: 'Americano', category: 'espresso', modifierGroupIds: [GROUP_SIZE, GROUP_TEMP], available: true, createdAt: now, updatedAt: now },
      // Milk-based espresso drinks - size + milk + temp
      { id: 'item-latte', name: 'Latte', category: 'espresso', modifierGroupIds: [GROUP_SIZE, GROUP_MILK, GROUP_TEMP], available: true, createdAt: now, updatedAt: now },
      { id: 'item-cappuccino', name: 'Cappuccino', category: 'espresso', modifierGroupIds: [GROUP_SIZE, GROUP_MILK, GROUP_TEMP], available: true, createdAt: now, updatedAt: now },
      { id: 'item-mocha', name: 'Mocha', category: 'espresso', modifierGroupIds: [GROUP_SIZE, GROUP_MILK, GROUP_TEMP], available: true, createdAt: now, updatedAt: now },
      // Drip - size + temp
      { id: 'item-drip', name: 'Drip Coffee', category: 'drip', modifierGroupIds: [GROUP_SIZE, GROUP_TEMP], available: true, createdAt: now, updatedAt: now },
      // Pour over - temp only (typically single serve)
      { id: 'item-pourover', name: 'Pour Over', category: 'drip', modifierGroupIds: [GROUP_TEMP], available: true, createdAt: now, updatedAt: now },
      // Tea - size + temp
      { id: 'item-tea', name: 'Hot Tea', category: 'tea', modifierGroupIds: [GROUP_SIZE, GROUP_TEMP], available: true, createdAt: now, updatedAt: now },
      // Matcha - size + milk + temp
      { id: 'item-matcha', name: 'Matcha Latte', category: 'tea', modifierGroupIds: [GROUP_SIZE, GROUP_MILK, GROUP_TEMP], available: true, createdAt: now, updatedAt: now },
    ]);
  }
}

export async function initializeDatabase() {
  await seedDefaultModifierGroups();
  await seedDefaultMenuItems();
}

export { db };


import Dexie, { type EntityTable } from 'dexie';
import type { MenuItem, CustomizationOption, Session, Order } from './types';

const db = new Dexie('SideOrderDB') as Dexie & {
  menuItems: EntityTable<MenuItem, 'id'>;
  customizations: EntityTable<CustomizationOption, 'id'>;
  sessions: EntityTable<Session, 'id'>;
  orders: EntityTable<Order, 'id'>;
};

db.version(1).stores({
  menuItems: 'id, name, category, available, createdAt',
  customizations: 'id, category, name, available',
  sessions: 'id, status, startedAt, endedAt',
  orders: 'id, sessionId, timestamp',
});

// Seed default customization options if none exist
export async function seedDefaultCustomizations() {
  const count = await db.customizations.count();
  if (count === 0) {
    await db.customizations.bulkAdd([
      // Temperatures
      { id: 'temp-hot', category: 'temperature', name: 'Hot', available: true },
      { id: 'temp-iced', category: 'temperature', name: 'Iced', available: true },
      
      // Milks
      { id: 'milk-whole', category: 'milk', name: 'Whole', available: true },
      { id: 'milk-oat', category: 'milk', name: 'Oat', available: true },
      { id: 'milk-almond', category: 'milk', name: 'Almond', available: true },
      { id: 'milk-none', category: 'milk', name: 'None', available: true },
      
      // Syrups
      { id: 'syrup-vanilla', category: 'syrup', name: 'Vanilla', available: true },
      { id: 'syrup-caramel', category: 'syrup', name: 'Caramel', available: true },
      { id: 'syrup-hazelnut', category: 'syrup', name: 'Hazelnut', available: true },
      { id: 'syrup-none', category: 'syrup', name: 'None', available: true },
      
      // Sizes
      { id: 'size-small', category: 'size', name: 'Small', available: true },
      { id: 'size-regular', category: 'size', name: 'Regular', available: true },
      { id: 'size-large', category: 'size', name: 'Large', available: true },
    ]);
  }
}

// Seed a few default menu items if none exist
export async function seedDefaultMenuItems() {
  const count = await db.menuItems.count();
  if (count === 0) {
    const now = Date.now();
    await db.menuItems.bulkAdd([
      { id: 'item-espresso', name: 'Espresso', category: 'espresso', available: true, createdAt: now, updatedAt: now },
      { id: 'item-americano', name: 'Americano', category: 'espresso', available: true, createdAt: now, updatedAt: now },
      { id: 'item-latte', name: 'Latte', category: 'espresso', available: true, createdAt: now, updatedAt: now },
      { id: 'item-cappuccino', name: 'Cappuccino', category: 'espresso', available: true, createdAt: now, updatedAt: now },
      { id: 'item-mocha', name: 'Mocha', category: 'espresso', available: true, createdAt: now, updatedAt: now },
      { id: 'item-drip', name: 'Drip Coffee', category: 'drip', available: true, createdAt: now, updatedAt: now },
      { id: 'item-pourover', name: 'Pour Over', category: 'drip', available: true, createdAt: now, updatedAt: now },
      { id: 'item-tea', name: 'Hot Tea', category: 'tea', available: true, createdAt: now, updatedAt: now },
      { id: 'item-matcha', name: 'Matcha Latte', category: 'tea', available: true, createdAt: now, updatedAt: now },
    ]);
  }
}

export async function initializeDatabase() {
  await seedDefaultCustomizations();
  await seedDefaultMenuItems();
}

export { db };

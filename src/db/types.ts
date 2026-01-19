export interface Category {
  id: string;
  name: string;
  sortOrder: number;
  available: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  baseCost?: number;
  available: boolean;
  modifierGroupIds: string[];
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

export interface ModifierOption {
  id: string;
  name: string;
  available: boolean;
  priceAdditive?: number; // Optional price additive (e.g., 0.50 for +$0.50)
}

export interface ModifierGroup {
  id: string;
  name: string;
  options: ModifierOption[];
  multiSelect: boolean;
  required: boolean;
  available: boolean;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

// Legacy type - kept for backward compatibility with old sessions
export interface CustomizationOption {
  id: string;
  category: 'temperature' | 'milk' | 'syrup' | 'size';
  name: string;
  costModifier?: number;
  available: boolean;
}

export interface MenuSnapshot {
  items: MenuItem[];
  modifierGroups: ModifierGroup[];
  categories: Category[];
  // Legacy field for backward compatibility
  customizations?: CustomizationOption[];
}

export interface Session {
  id: string;
  name: string;
  status: 'active' | 'closed';
  startedAt: number;
  endedAt?: number;
  customerCount?: number;
  notes: string;
  menuSnapshot: MenuSnapshot;
}

// Legacy customizations format for old orders
export interface LegacyOrderCustomizations {
  temperature?: string;
  milk?: string;
  syrup?: string;
  size?: string;
}

// New customizations format: groupId -> selected option names
export type OrderCustomizations = Record<string, string[]>;

export interface Order {
  id: string;
  sessionId: string;
  timestamp: number;
  itemName: string;
  itemCategory: string; // Category name stored for historical record
  customizations: OrderCustomizations | LegacyOrderCustomizations;
  notes: string;
}

// Type guard to check if customizations are in new format
export function isNewCustomizations(
  customizations: OrderCustomizations | LegacyOrderCustomizations
): customizations is OrderCustomizations {
  // New format uses arrays as values, legacy uses strings
  const values = Object.values(customizations);
  if (values.length === 0) return true;
  return Array.isArray(values[0]);
}

// For creating new records (sortOrder is auto-assigned if not provided)
export type NewCategory = Omit<Category, 'id' | 'createdAt' | 'updatedAt'> & { sortOrder?: number };
export type NewMenuItem = Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt' | 'sortOrder'> & { sortOrder?: number };
export type NewModifierGroup = Omit<ModifierGroup, 'id' | 'createdAt' | 'updatedAt' | 'sortOrder'> & { sortOrder?: number };
export type NewOrder = Omit<Order, 'id' | 'timestamp'>;

// App settings (key-value store)
export interface Setting {
  key: string;
  value: string;
}


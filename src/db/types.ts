export interface MenuItem {
  id: string;
  name: string;
  category: 'espresso' | 'drip' | 'tea' | 'other';
  baseCost?: number;
  available: boolean;
  modifierGroupIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ModifierOption {
  id: string;
  name: string;
  available: boolean;
  // costModifier?: number; // Reserved for future pricing
}

export interface ModifierGroup {
  id: string;
  name: string;
  options: ModifierOption[];
  multiSelect: boolean;
  required: boolean;
  available: boolean;
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
  itemCategory: MenuItem['category'];
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

// For creating new records
export type NewMenuItem = Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>;
export type NewModifierGroup = Omit<ModifierGroup, 'id' | 'createdAt' | 'updatedAt'>;
export type NewOrder = Omit<Order, 'id' | 'timestamp'>;


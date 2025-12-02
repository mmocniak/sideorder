export interface MenuItem {
  id: string;
  name: string;
  category: 'espresso' | 'drip' | 'tea' | 'other';
  baseCost?: number;
  available: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CustomizationOption {
  id: string;
  category: 'temperature' | 'milk' | 'syrup' | 'size';
  name: string;
  costModifier?: number;
  available: boolean;
}

export interface MenuSnapshot {
  items: MenuItem[];
  customizations: CustomizationOption[];
}

export interface Session {
  id: string;
  status: 'active' | 'closed';
  startedAt: number;
  endedAt?: number;
  customerCount?: number;
  notes: string;
  menuSnapshot: MenuSnapshot;
}

export interface Order {
  id: string;
  sessionId: string;
  timestamp: number;
  itemName: string;
  itemCategory: MenuItem['category'];
  customizations: {
    temperature?: string;
    milk?: string;
    syrup?: string;
    size?: string;
  };
  notes: string;
}

// For creating new records
export type NewMenuItem = Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>;
export type NewCustomizationOption = Omit<CustomizationOption, 'id'>;
export type NewOrder = Omit<Order, 'id' | 'timestamp'>;

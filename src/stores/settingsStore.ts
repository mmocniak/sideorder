import { create } from 'zustand';
import { db } from '@/db';

interface SettingsState {
  shopName: string;
  isLoading: boolean;

  loadSettings: () => Promise<void>;
  updateShopName: (name: string) => Promise<void>;
}

const DEFAULT_SHOP_NAME = 'Side Order';

export const useSettingsStore = create<SettingsState>((set) => ({
  shopName: DEFAULT_SHOP_NAME,
  isLoading: true,

  loadSettings: async () => {
    set({ isLoading: true });

    const shopNameSetting = await db.settings.get('shopName');

    set({
      shopName: shopNameSetting?.value || DEFAULT_SHOP_NAME,
      isLoading: false,
    });
  },

  updateShopName: async (name: string) => {
    const trimmedName = name.trim() || DEFAULT_SHOP_NAME;

    await db.settings.put({ key: 'shopName', value: trimmedName });

    set({ shopName: trimmedName });
  },
}));

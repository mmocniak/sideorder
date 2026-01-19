import { create } from 'zustand';
import { db } from '@/db';
import { applyTheme, type Theme } from '@/lib/theme';

interface SettingsState {
  shopName: string;
  theme: Theme;
  isLoading: boolean;

  loadSettings: () => Promise<void>;
  updateShopName: (name: string) => Promise<void>;
  updateTheme: (theme: Theme) => Promise<void>;
}

const DEFAULT_SHOP_NAME = 'Side Order';
const DEFAULT_THEME: Theme = 'auto';

export const useSettingsStore = create<SettingsState>((set) => ({
  shopName: DEFAULT_SHOP_NAME,
  theme: DEFAULT_THEME,
  isLoading: true,

  loadSettings: async () => {
    set({ isLoading: true });

    const [shopNameSetting, themeSetting] = await Promise.all([
      db.settings.get('shopName'),
      db.settings.get('theme'),
    ]);

    const theme = (themeSetting?.value as Theme) || DEFAULT_THEME;

    // Apply theme immediately on load
    applyTheme(theme);

    set({
      shopName: shopNameSetting?.value || DEFAULT_SHOP_NAME,
      theme,
      isLoading: false,
    });
  },

  updateShopName: async (name: string) => {
    const trimmedName = name.trim() || DEFAULT_SHOP_NAME;

    await db.settings.put({ key: 'shopName', value: trimmedName });

    set({ shopName: trimmedName });
  },

  updateTheme: async (theme: Theme) => {
    await db.settings.put({ key: 'theme', value: theme });

    applyTheme(theme);

    set({ theme });
  },
}));

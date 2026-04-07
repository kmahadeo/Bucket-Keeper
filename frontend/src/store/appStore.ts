// Bucket Keeper - App-wide State Store

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeMode, ThemeName } from '../types';
import { initDatabase } from '../database/database';

const THEME_MODE_KEY = 'bucket_keeper_theme_mode';
const THEME_NAME_KEY = 'bucket_keeper_theme_name';

interface AppState {
  themeMode: ThemeMode;
  themeName: ThemeName;
  isDbReady: boolean;
  isAppReady: boolean;

  initializeApp: () => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setThemeName: (name: ThemeName) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  themeMode: 'dark',
  themeName: 'default',
  isDbReady: false,
  isAppReady: false,

  initializeApp: async () => {
    try {
      // Load persisted theme preferences
      const [savedMode, savedName] = await Promise.all([
        AsyncStorage.getItem(THEME_MODE_KEY),
        AsyncStorage.getItem(THEME_NAME_KEY),
      ]);

      if (savedMode === 'light' || savedMode === 'dark') {
        set({ themeMode: savedMode });
      }
      if (savedName) {
        set({ themeName: savedName as ThemeName });
      }

      // Initialize SQLite database (skipped on web)
      const result = initDatabase();
      set({ isDbReady: result !== null, isAppReady: true });
    } catch (error) {
      console.error('Failed to initialize app:', error);
      // Still mark as ready so the app doesn't hang
      set({ isAppReady: true });
    }
  },

  setThemeMode: async (mode) => {
    set({ themeMode: mode });
    await AsyncStorage.setItem(THEME_MODE_KEY, mode);
  },

  setThemeName: async (name) => {
    set({ themeName: name });
    await AsyncStorage.setItem(THEME_NAME_KEY, name);
  },
}));

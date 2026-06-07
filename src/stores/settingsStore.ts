import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ColorScheme = 'light' | 'dark' | 'system';

interface SettingsState {
  colorScheme: ColorScheme;
  hydrated: boolean;
  setColorScheme: (scheme: ColorScheme) => void;
  hydrate: () => Promise<void>;
}

const STORAGE_KEY = '@habitquest/colorScheme';

export const useSettingsStore = create<SettingsState>((set) => ({
  colorScheme: 'system',
  hydrated: false,

  setColorScheme(scheme) {
    set({ colorScheme: scheme });
    AsyncStorage.setItem(STORAGE_KEY, scheme).catch(() => null);
  },

  async hydrate() {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      set({ colorScheme: stored, hydrated: true });
    } else {
      set({ hydrated: true });
    }
  },
}));

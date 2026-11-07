'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { themeStorage, type Theme } from '../services/theme.storage';

export function useTheme(): {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
} {
  const theme = useSyncExternalStore(
    themeStorage.subscribe,
    themeStorage.getTheme,
    (): Theme => 'light',
  );
  const toggleTheme = useCallback(
    () => themeStorage.set(themeStorage.getTheme() === 'dark' ? 'light' : 'dark'),
    [],
  );
  return { theme, setTheme: themeStorage.set, toggleTheme };
}

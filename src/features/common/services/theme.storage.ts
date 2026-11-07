import { THEME_STORAGE_KEY } from '../config';

export type Theme = 'light' | 'dark';

const listeners = new Set<() => void>();

function readStoredTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
}

function notify(): void {
  listeners.forEach((listener) => listener());
}

/**
 * Tema claro/oscuro. La preferencia explícita se guarda en localStorage; sin ella se sigue
 * `prefers-color-scheme`. El script de `ThemeScript` aplica el tema antes de pintar (sin parpadeo).
 */
export const themeStorage = {
  /** Lee el tema realmente aplicado al documento. */
  getTheme(): Theme {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  },

  set(theme: Theme): void {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Sin almacenamiento disponible el tema solo dura la sesión de la página.
    }
    applyTheme(theme);
    notify();
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystemChange = () => {
      if (readStoredTheme() === null) {
        applyTheme(systemTheme());
        notify();
      }
    };
    media.addEventListener('change', onSystemChange);
    return () => {
      listeners.delete(listener);
      media.removeEventListener('change', onSystemChange);
    };
  },
};

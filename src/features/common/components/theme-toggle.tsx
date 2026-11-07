'use client';

import { Moon, Sun } from 'lucide-react';
import { useTranslation } from '../../i18n/hooks/use-translation';
import { useTheme } from '../hooks/use-theme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  return (
    <button
      aria-label={t('common.themeToggle')}
      aria-pressed={theme === 'dark'}
      className="inline-flex size-11 items-center justify-center rounded-lg text-foreground transition-colors duration-150 hover:bg-surface-muted"
      onClick={toggleTheme}
      type="button"
    >
      <Sun aria-hidden="true" className="hidden size-5 dark:block" />
      <Moon aria-hidden="true" className="size-5 dark:hidden" />
    </button>
  );
}

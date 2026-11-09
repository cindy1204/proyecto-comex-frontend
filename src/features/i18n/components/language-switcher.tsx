'use client';

import { cn } from '../../common/utils/cn';
import { LOCALES, LOCALE_NAMES, type Locale } from '../domain/locale';
import { useLocale } from '../hooks/use-locale';
import { useTranslation } from '../hooks/use-translation';

/**
 * Selector ES | EN. Cada botón expone el nombre completo del idioma (`aria-label` + `lang`) y el
 * activo se marca con `aria-pressed`. Cambiar de idioma guarda la cookie y refresca la ruta.
 */
export function LanguageSwitcher({ className }: Readonly<{ className?: string }>) {
  const { t } = useTranslation();
  const { locale, setLocale, isPending } = useLocale();

  return (
    <div
      aria-label={t('i18n.switcherLabel')}
      className={cn('inline-flex items-center rounded-lg border border-border p-0.5', className)}
      role="group"
    >
      {LOCALES.map((option: Locale) => {
        const isActive = option === locale;
        return (
          <button
            aria-label={LOCALE_NAMES[option]}
            aria-pressed={isActive}
            className={cn(
              'inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-2.5 text-sm font-semibold transition-colors duration-150',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-surface-muted',
            )}
            disabled={isPending}
            key={option}
            lang={option}
            onClick={() => setLocale(option)}
            type="button"
          >
            <span aria-hidden="true">{option.toUpperCase()}</span>
          </button>
        );
      })}
    </div>
  );
}

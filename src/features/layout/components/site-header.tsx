'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useState } from 'react';
import { ThemeToggle } from '../../common/components/theme-toggle';
import { Container } from '../../common/components/container';
import { useNavigation, type NavigationItem } from '../../dashboard/hooks/use-navigation';
import { cn } from '../../common/utils/cn';
import { LanguageSwitcher } from '../../i18n/components/language-switcher';
import { useTranslation } from '../../i18n/hooks/use-translation';
import { AccountActions } from './account-actions';
import { Brand } from './brand';

function NavLinks({
  items,
  onNavigate,
  className,
}: Readonly<{ items: NavigationItem[]; onNavigate?: () => void; className?: string }>) {
  const { t } = useTranslation();

  return (
    <ul className={cn('flex gap-0.5', className)}>
      {items.map((item) => (
        <li key={item.labelKey}>
          <Link
            aria-current={item.isActive ? 'page' : undefined}
            className={cn(
              'flex min-h-11 items-center rounded-lg px-3 text-sm font-medium whitespace-nowrap transition-colors duration-150 hover:bg-surface-muted xl:px-2.5',
              item.isActive ? 'bg-primary-soft text-primary-soft-foreground' : 'text-foreground',
            )}
            href={item.href}
            onClick={onNavigate}
          >
            {t(item.labelKey)}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function SiteHeader() {
  const { t } = useTranslation();
  const items = useNavigation();
  const pathname = usePathname();
  const panelId = useId();
  // El menú móvil se asocia a la ruta en la que se abrió: al navegar se cierra solo.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const isOpen = openOn === pathname;

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenOn(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <Brand />
          <nav aria-label={t('layout.mainNav')} className="hidden xl:block">
            <NavLinks items={items} />
          </nav>
          <div className="hidden items-center gap-3 xl:flex">
            <LanguageSwitcher />
            <ThemeToggle />
            <AccountActions />
          </div>
          <div className="flex items-center gap-1 xl:hidden">
            <ThemeToggle />
            <button
              aria-controls={panelId}
              aria-expanded={isOpen}
              aria-label={isOpen ? t('layout.closeMenu') : t('layout.openMenu')}
              className="inline-flex size-11 items-center justify-center rounded-lg text-foreground transition-colors duration-150 hover:bg-surface-muted"
              onClick={() => setOpenOn(isOpen ? null : pathname)}
              type="button"
            >
              {isOpen ? (
                <X aria-hidden="true" className="size-6" />
              ) : (
                <Menu aria-hidden="true" className="size-6" />
              )}
            </button>
          </div>
        </div>
        <div
          className={cn(
            'max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain pb-4 xl:hidden',
            !isOpen && 'hidden',
          )}
          id={panelId}
        >
          <nav aria-label={t('layout.mobileNav')}>
            <NavLinks className="flex-col" items={items} onNavigate={() => setOpenOn(null)} />
          </nav>
          <div className="mt-4 flex flex-col gap-4 border-t border-border pt-4">
            <LanguageSwitcher />
            <AccountActions />
          </div>
        </div>
      </Container>
    </header>
  );
}

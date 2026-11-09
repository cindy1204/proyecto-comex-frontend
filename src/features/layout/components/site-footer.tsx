import Link from 'next/link';
import { Container } from '../../common/components/container';
import { ROUTES } from '../../common/config';
import { getTranslations } from '../../i18n/services/get-translations';
import { Brand } from './brand';

export async function SiteFooter() {
  const { t } = await getTranslations();

  return (
    <footer className="border-t border-border bg-surface">
      <Container className="grid gap-8 py-10 md:grid-cols-3">
        <div>
          <Brand />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">{t('meta.siteDescription')}</p>
        </div>
        <nav aria-label={t('layout.footer.linksLabel')}>
          <h2 className="type-label text-foreground">{t('layout.footer.explore')}</h2>
          <ul className="mt-1 text-sm text-muted-foreground">
            <li>
              <Link
                className="inline-flex min-h-11 items-center hover:text-foreground hover:underline"
                href={ROUTES.services}
              >
                {t('nav.services')}
              </Link>
            </li>
            <li>
              <Link
                className="inline-flex min-h-11 items-center hover:text-foreground hover:underline"
                href={ROUTES.catalog}
              >
                {t('layout.footer.catalog')}
              </Link>
            </li>
            <li>
              <Link
                className="inline-flex min-h-11 items-center hover:text-foreground hover:underline"
                href={ROUTES.contact}
              >
                {t('nav.contact')}
              </Link>
            </li>
          </ul>
        </nav>
        <div>
          <h2 className="type-label text-foreground">{t('layout.footer.noticeTitle')}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{t('layout.footer.notice')}</p>
        </div>
      </Container>
      <div className="border-t border-border py-4 text-center text-sm text-muted-foreground">
        {t('layout.footer.tagline')}
      </div>
    </footer>
  );
}

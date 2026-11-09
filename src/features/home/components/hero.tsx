import Link from 'next/link';
import { buttonStyles } from '../../common/components/button';
import { Container } from '../../common/components/container';
import { NumeralCode } from '../../common/components/numeral-code';
import { ROUTES } from '../../common/config';
import { getTranslations } from '../../i18n/services/get-translations';

/** Libro de numerales decorativo (solo cifras y monedas ISO: no lleva texto traducible). */
const LEDGER = [
  { code: '1010', currency: 'USD' },
  { code: '1063', currency: 'COP' },
  { code: '2905', currency: 'EUR' },
  { code: '4505', currency: 'USD' },
] as const;

export async function Hero() {
  const { t } = await getTranslations();

  return (
    <section className="border-b border-border bg-surface-muted">
      <Container className="grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="max-w-3xl">
          <p className="type-eyebrow text-primary">{t('home.hero.eyebrow')}</p>
          <h1 className="mt-3 type-display text-foreground">{t('home.hero.title')}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{t('home.hero.description')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className={buttonStyles({ size: 'lg' })} href={ROUTES.contact}>
              {t('home.hero.primaryAction')}
            </Link>
            <Link
              className={buttonStyles({ size: 'lg', variant: 'outline' })}
              href={ROUTES.catalog}
            >
              {t('home.hero.secondaryAction')}
            </Link>
          </div>
        </div>
        <ul
          aria-hidden="true"
          className="hidden flex-col gap-3 rounded-xl border border-border bg-surface p-6 shadow-card lg:flex"
        >
          {LEDGER.map((row) => (
            <li className="flex items-center gap-3" key={row.code}>
              <NumeralCode code={row.code} />
              <span className="flex-1 border-b border-dotted border-border" />
              <span className="type-numeral text-sm text-muted-foreground">{row.currency}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

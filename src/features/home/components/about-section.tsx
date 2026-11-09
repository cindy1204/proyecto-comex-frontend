import { Container } from '../../common/components/container';
import { getTranslations } from '../../i18n/services/get-translations';

const AUDIENCES = ['traders', 'investors', 'services'] as const;
const STEPS = ['catalog', 'account', 'follow'] as const;

export async function AboutSection() {
  const { t } = await getTranslations();

  return (
    <section className="scroll-mt-20 border-y border-border bg-surface-muted py-16" id="nosotros">
      <Container className="grid gap-12 lg:grid-cols-2">
        <div>
          <h2 className="type-title text-foreground">{t('home.about.audienceTitle')}</h2>
          <ul className="mt-6 flex flex-col gap-5">
            {AUDIENCES.map((audience) => (
              <li key={audience}>
                <h3 className="type-subtitle text-foreground">
                  {t(`home.about.audiences.${audience}.title`)}
                </h3>
                <p className="text-muted-foreground">
                  {t(`home.about.audiences.${audience}.description`)}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="type-title text-foreground">{t('home.about.stepsTitle')}</h2>
          <ol className="mt-6 flex flex-col gap-5">
            {STEPS.map((step, index) => (
              <li className="flex gap-4" key={step}>
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary type-figure text-primary-foreground"
                >
                  {index + 1}
                </span>
                <p className="text-foreground">{t(`home.about.steps.${step}`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}

import { Alert } from '../../common/components/alert';
import { Container } from '../../common/components/container';
import { FORBIDDEN_PARAM } from '../../common/config';
import { getTranslations } from '../../i18n/services/get-translations';

export type HomeSearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Aviso de acceso denegado: `proxy.ts` y `RoleGuard` redirigen a `/?forbidden=1` cuando el rol no
 * puede abrir una sección. Tono `warning` (`role="alert"`): se anuncia al llegar a la página.
 */
export async function ForbiddenNotice({
  searchParams,
}: Readonly<{ searchParams: HomeSearchParams }>) {
  const params = await searchParams;
  if (params[FORBIDDEN_PARAM] === undefined) return null;
  const { t } = await getTranslations();

  return (
    <Container className="pt-6">
      <Alert tone="warning">{t('home.forbidden')}</Alert>
    </Container>
  );
}

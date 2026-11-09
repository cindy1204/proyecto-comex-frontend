import { Loading } from '@/features/common/components/loading';
import { getTranslations } from '@/features/i18n/services/get-translations';

export default async function AppLoading() {
  const { t } = await getTranslations();
  return <Loading className="min-h-[50vh]" label={t('common.loadingPage')} />;
}

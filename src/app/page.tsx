import { RequestBoundary } from '@/features/i18n/components/request-boundary';
import { AboutSection } from '@/features/home/components/about-section';
import { CtaSection } from '@/features/home/components/cta-section';
import {
  ForbiddenNotice,
  type HomeSearchParams,
} from '@/features/home/components/forbidden-notice';
import { Hero } from '@/features/home/components/hero';
import { ServicesSection } from '@/features/home/components/services-section';

export default function HomePage({ searchParams }: Readonly<{ searchParams: HomeSearchParams }>) {
  return (
    <RequestBoundary>
      <ForbiddenNotice searchParams={searchParams} />
      <Hero />
      <ServicesSection />
      <AboutSection />
      <CtaSection />
    </RequestBoundary>
  );
}

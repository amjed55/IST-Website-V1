import { getTranslations } from 'next-intl/server';
import { PageHero } from '@/components/PageHero';
import { CalendarView } from '@/components/CalendarView';
import { PageTransition } from '@/components/motion';
import { Section } from '@/components/ui';
import { images } from '@/lib/images';
import type { AppLocale } from '@/i18n/routing';

export default async function LocalizedEventsPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Events' });
  return (
    <PageTransition>
      <PageHero
        compact
        image={images.events}
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />
      <Section>
        <CalendarView />
      </Section>
    </PageTransition>
  );
}

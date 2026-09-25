import { getTranslations } from 'next-intl/server';
import { PageHero } from '@/components/PageHero';
import { JummahSchedule } from '@/components/JummahSchedule';
import { PrayerEmbed } from '@/components/PrayerEmbed';
import { FadeIn, PageTransition } from '@/components/motion';
import { Section } from '@/components/ui';
import { images } from '@/lib/images';
import type { AppLocale } from '@/i18n/routing';

export default async function LocalizedPrayerPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Prayer' });

  return (
    <PageTransition>
      <PageHero
        compact
        image={images.services}
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />
      <Section className="!pt-8">
        <JummahSchedule />
      </Section>
      <Section className="section-band !py-14">
        <FadeIn>
          <p className="mb-6 max-w-2xl text-sm text-ist-muted">{t('boardNote')}</p>
          <PrayerEmbed />
        </FadeIn>
      </Section>
    </PageTransition>
  );
}

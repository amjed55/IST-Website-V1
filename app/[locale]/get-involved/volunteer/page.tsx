import { getTranslations } from 'next-intl/server';
import { PageHero } from '@/components/PageHero';
import { PageTransition } from '@/components/motion';
import { SiteForm } from '@/components/SiteForm';
import { Section } from '@/components/ui';
import { images } from '@/lib/images';
import type { AppLocale } from '@/i18n/routing';

export default async function LocalizedVolunteerPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Volunteer' });
  return (
    <PageTransition>
      <PageHero
        compact
        image={images.connect.volunteer}
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />
      <Section>
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow-soft sm:p-8">
          <SiteForm type="volunteer" />
        </div>
      </Section>
    </PageTransition>
  );
}

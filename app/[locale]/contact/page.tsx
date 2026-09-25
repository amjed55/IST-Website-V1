import { getTranslations } from 'next-intl/server';
import { PageHero } from '@/components/PageHero';
import { PageTransition } from '@/components/motion';
import { SiteForm } from '@/components/SiteForm';
import { Section } from '@/components/ui';
import { images } from '@/lib/images';
import { site } from '@/lib/content';
import type { AppLocale } from '@/i18n/routing';

export default async function LocalizedContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ topic?: string }>;
}) {
  const [{ locale }, { topic }] = await Promise.all([params, searchParams]);
  const t = await getTranslations({ locale, namespace: 'Contact' });

  return (
    <PageTransition>
      <PageHero
        compact
        image={images.visit}
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />
      <Section>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6 rounded-3xl bg-white p-6 shadow-soft">
            <h2 className="font-display text-3xl text-ist-green">{t('hours')}</h2>
            <p className="text-ist-ink/65">{t('hoursBody')}</p>
            <div className="space-y-2 text-sm">
              <p>{site.address}</p>
              <a className="block font-semibold text-ist-teal" href={site.phoneHref}>
                {site.phone}
              </a>
              <a className="block font-semibold text-ist-teal" href={site.emailHref}>
                {site.email}
              </a>
            </div>
          </div>
          <div>
            <h2 className="font-display text-3xl text-ist-green">{t('message')}</h2>
            <div className="mt-5">
              <SiteForm type="contact" prefill={{ topic: topic || 'General' }} />
            </div>
          </div>
        </div>
      </Section>
    </PageTransition>
  );
}

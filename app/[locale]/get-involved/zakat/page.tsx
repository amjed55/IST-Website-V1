import { getTranslations } from 'next-intl/server';
import { PageHero } from '@/components/PageHero';
import { PageTransition } from '@/components/motion';
import { ZakatCalculator } from '@/components/ZakatCalculator';
import { Section } from '@/components/ui';
import { images } from '@/lib/images';
import type { AppLocale } from '@/i18n/routing';

export default async function LocalizedZakatPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Zakat' });
  return (
    <PageTransition>
      <PageHero
        compact
        image={images.connect.donate}
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />
      <Section>
        <p className="mb-8 max-w-3xl border-l-4 border-ist-gold bg-ist-gold/10 p-5 text-ist-ink/70">
          {t('disclaimer')}
        </p>
        <ZakatCalculator />
      </Section>
    </PageTransition>
  );
}

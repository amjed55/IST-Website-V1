import { getTranslations } from 'next-intl/server';
import { PageHero } from '@/components/PageHero';
import { PageTransition, Stagger, StaggerItem } from '@/components/motion';
import { Button, Section } from '@/components/ui';
import { images } from '@/lib/images';
import { site } from '@/lib/content';
import { localeHref } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';

export default async function LocalizedVisitPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  const [t, common] = await Promise.all([
    getTranslations({ locale, namespace: 'Visit' }),
    getTranslations({ locale, namespace: 'Common' }),
  ]);
  const maps = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(site.address)}`;

  return (
    <PageTransition>
      <PageHero
        compact
        image={images.visit}
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
        actions={
          <>
            <Button href={maps} variant="teal" external>
              {t('maps')}
            </Button>
            <Button href={localeHref(locale, '/contact')} variant="light">
              {common('contactOffice')}
            </Button>
          </>
        }
      />
      <Section>
        <Stagger className="grid gap-5 md:grid-cols-2">
          <StaggerItem>
            <article className="h-full border-l-4 border-ist-gold bg-ist-gold/10 p-6">
              <h2 className="font-display text-3xl text-ist-green">{t('parkingTitle')}</h2>
              <p className="mt-3 leading-relaxed text-ist-ink/70">{t('parkingBody')}</p>
            </article>
          </StaggerItem>
          <StaggerItem>
            <article className="h-full border border-ist-green/10 bg-white p-6 shadow-soft">
              <h2 className="font-display text-3xl text-ist-green">{t('firstTitle')}</h2>
              <p className="mt-3 leading-relaxed text-ist-ink/70">{t('firstBody')}</p>
            </article>
          </StaggerItem>
        </Stagger>
        <iframe
          title={t('maps')}
          src={site.mapEmbed}
          className="mt-8 h-[360px] w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </Section>
    </PageTransition>
  );
}

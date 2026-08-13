import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { PageHero } from '@/components/PageHero';
import { JummahSchedule } from '@/components/JummahSchedule';
import { PageTransition, Stagger, StaggerItem } from '@/components/motion';
import { Button, Section } from '@/components/ui';
import { images } from '@/lib/images';
import { localeHref } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';

export default async function LocalizedHome({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  const [t, common, nav] = await Promise.all([
    getTranslations({ locale, namespace: 'Home' }),
    getTranslations({ locale, namespace: 'Common' }),
    getTranslations({ locale, namespace: 'Nav' }),
  ]);
  const quickLinks = [
    ['/prayer-times', nav('prayerTimes')],
    ['/events', nav('events')],
    ['/visit', nav('visit')],
    ['/contact', nav('contact')],
  ] as const;

  return (
    <PageTransition>
      <PageHero
        image={images.hero}
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
        actions={
          <>
            <Button href={localeHref(locale, '/visit')} variant="light">
              {common('planVisit')}
            </Button>
            <Button href={localeHref(locale, '/prayer-times')} variant="gold">
              {common('viewPrayerTimes')}
            </Button>
          </>
        }
      />
      <Section>
        <span className="eyebrow">{t('explore')}</span>
        <h2 className="mt-4 font-display text-4xl text-ist-green sm:text-5xl">
          {t('welcomeTitle')}
        </h2>
        <p className="mt-3 max-w-2xl text-ist-ink/65">{t('welcomeBody')}</p>
        <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map(([href, label]) => (
            <StaggerItem key={href}>
              <Link
                href={localeHref(locale, href)}
                className="card group block border border-ist-green/10 p-5"
              >
                <span className="font-display text-2xl text-ist-green">{label}</span>
                <span className="mt-4 block text-sm font-semibold text-ist-teal transition group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                  {common('learnMore')} →
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>
      <Section className="section-band">
        <h2 className="sr-only">{t('jummah')}</h2>
        <JummahSchedule />
      </Section>
    </PageTransition>
  );
}

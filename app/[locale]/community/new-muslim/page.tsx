import { getTranslations } from 'next-intl/server';
import { PageHero } from '@/components/PageHero';
import { PageTransition, Stagger, StaggerItem } from '@/components/motion';
import { Button, Section } from '@/components/ui';
import { images } from '@/lib/images';
import { localeHref } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';

export default async function LocalizedNewMuslimPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  const [t, common] = await Promise.all([
    getTranslations({ locale, namespace: 'NewMuslim' }),
    getTranslations({ locale, namespace: 'Common' }),
  ]);
  const cards = [
    ['visit', 'visitBody'],
    ['shahada', 'shahadaBody'],
    ['prayer', 'prayerBody'],
    ['community', 'communityBody'],
  ] as const;

  return (
    <PageTransition>
      <PageHero
        compact
        image={images.community}
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
        actions={
          <>
            <Button href={localeHref(locale, '/contact')} variant="gold">
              {common('contactOffice')}
            </Button>
            <Button href={localeHref(locale, '/visit')} variant="ghost">
              {common('planVisit')}
            </Button>
          </>
        }
      />
      <Section>
        <Stagger className="grid gap-5 md:grid-cols-2">
          {cards.map(([title, body], index) => (
            <StaggerItem key={title}>
              <article className="card h-full border border-ist-green/10 p-6">
                <span className="font-display text-4xl text-ist-gold">0{index + 1}</span>
                <h2 className="mt-3 font-display text-3xl text-ist-green">{t(title)}</h2>
                <p className="mt-3 leading-relaxed text-ist-ink/65">{t(body)}</p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>
    </PageTransition>
  );
}

import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { isAppLocale } from '@/i18n/routing';
import { localeHref } from '@/i18n/navigation';

const links = [
  ['Home', '/'],
  ['Prayer times', '/prayer-times'],
  ['Plan a visit', '/visit'],
  ['Contact IST', '/contact'],
] as const;

export default async function NotFound() {
  const requestedLocale = await getLocale();
  const locale = isAppLocale(requestedLocale) ? requestedLocale : 'en';
  const [t, common] = await Promise.all([
    getTranslations({ locale, namespace: 'NotFound' }),
    getTranslations({ locale, namespace: 'Common' }),
  ]);
  return (
    <section className="container-ist flex min-h-[70vh] items-center py-16">
      <div className="relative w-full overflow-hidden rounded-[2rem] bg-ist-green px-6 py-16 text-center text-white shadow-lift sm:px-12">
        <div className="absolute inset-0 pattern-mesh opacity-10" aria-hidden />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ist-gold">
            {t('eyebrow')}
          </p>
          <h1 className="mt-5 font-display text-5xl sm:text-7xl">{t('title')}</h1>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            {t('body')}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {links.map(([label, href], index) => (
              <Link
                key={href}
                href={requestedLocale ? localeHref(locale, href) : href}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 ${
                  index === 0
                    ? 'bg-ist-gold text-ist-green-deep'
                    : 'border border-white/30 text-white hover:bg-white/10'
                }`}
              >
                {index === 0 ? common('backHome') : label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

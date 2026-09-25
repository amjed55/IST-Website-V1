'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { isAppLocale, localeNames, locales, type AppLocale } from '@/i18n/routing';

function localizedPath(pathname: string, locale: AppLocale) {
  const segments = pathname.split('/').filter(Boolean);
  if (isAppLocale(segments[0])) segments.shift();
  const rest = segments.length ? `/${segments.join('/')}` : '';
  return `/${locale}${rest}`;
}

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const current = useLocale();
  const pathname = usePathname();
  const t = useTranslations('Nav');

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{t('language')}</span>
      <select
        value={isAppLocale(current) ? current : 'en'}
        onChange={(event) => {
          window.location.href = localizedPath(pathname, event.target.value as AppLocale);
        }}
        className={`cursor-pointer rounded-full border border-ist-green/15 bg-white/80 font-semibold text-ist-green outline-none transition hover:border-ist-teal focus:border-ist-teal ${
          compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'
        }`}
        aria-label={t('language')}
      >
        {locales.map((locale) => (
          <option key={locale} value={locale}>
            {localeNames[locale]}
          </option>
        ))}
      </select>
    </label>
  );
}

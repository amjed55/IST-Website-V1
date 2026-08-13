import type { AppLocale } from './routing';

export function localeHref(locale: AppLocale, href: string) {
  if (!href.startsWith('/')) return href;
  return `/${locale}${href === '/' ? '' : href}`;
}

export const locales = ['en', 'ar', 'ur', 'ps', 'fa-AF', 'fr'] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = 'en';
export const rtlLocales = new Set<AppLocale>(['ar', 'ur', 'ps', 'fa-AF']);

export const localeNames: Record<AppLocale, string> = {
  en: 'English',
  ar: 'العربية',
  ur: 'اردو',
  ps: 'پښتو',
  'fa-AF': 'دری',
  fr: 'Français',
};

export function isAppLocale(value: string | null | undefined): value is AppLocale {
  return Boolean(value && (locales as readonly string[]).includes(value));
}

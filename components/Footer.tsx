import Link from 'next/link';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { links, primaryNav, site } from '@/lib/content';
import { connectLinks } from '@/lib/links';
import { connectIcons, IconInstagram, IconPrayer } from './icons';
import { isAppLocale } from '@/i18n/routing';

const navKeys: Record<string, string> = {
  '/': 'home',
  '/prayer-times': 'prayerTimes',
  '/about': 'about',
  '/education': 'education',
  '/community': 'community',
  '/services': 'services',
  '/events': 'events',
  '/visit': 'visit',
  '/get-involved': 'getInvolved',
  '/contact': 'contact',
};

const menuLinks = [
  ...primaryNav.map((item) => [item.label, item.href] as const),
  ['Careers', '/careers'] as const,
];

export async function Footer() {
  const localeHeader = (await headers()).get('x-ist-locale');
  const locale = isAppLocale(localeHeader) ? localeHeader : 'en';
  const localized = isAppLocale(localeHeader);
  const [t, nav] = await Promise.all([
    getTranslations({ locale, namespace: 'Footer' }),
    getTranslations({ locale, namespace: 'Nav' }),
  ]);
  const hrefFor = (href: string) =>
    localized && href.startsWith('/') ? `/${locale}${href === '/' ? '' : href}` : href;

  return (
    <footer className="border-t border-ist-green/10 bg-ist-green text-white">
      <div
        className="container-ist"
        style={{
          paddingBottom:
            'calc(var(--prayer-bar-h, 0px) + 2rem + env(safe-area-inset-bottom))',
        }}
      >
        <div className="grid gap-12 py-16 md:grid-cols-3">
          {/* Brand */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ist-teal-light">
              {t('contact')}
            </p>
            <p className="mt-5 font-display text-2xl leading-snug">{site.name}</p>
            <p className="mt-1 text-sm text-white/55">{site.masjid}</p>
            <div className="mt-5 space-y-1.5 text-sm text-white/60">
              <p>{site.address}</p>
              <p>
                <a href={site.phoneHref} className="transition hover:text-white">
                  {site.phone}
                </a>
              </p>
              <p>
                <a href={site.emailHref} className="transition hover:text-white">
                  {site.email}
                </a>
              </p>
            </div>
          </div>

          {/* Menu */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ist-teal-light">
              {t('menu')}
            </p>
            <nav className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2.5" aria-label="Footer menu">
              {menuLinks.map(([label, href]) => (
                <Link
                  key={`${label}-${href}`}
                  href={hrefFor(href)}
                  className="text-sm text-white/65 transition hover:text-white"
                >
                  {navKeys[href] ? nav(navKeys[href]) : label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Connect */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ist-teal-light">
              {t('connect')}
            </p>
            <div className="mt-5 space-y-3">
              {connectLinks.map((item) => {
                const Icon = connectIcons[item.id];
                return (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-white/65 transition hover:text-white"
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: item.accent }}
                    >
                      <Icon className="h-3.5 w-3.5 text-white" />
                    </span>
                    {item.label}
                  </a>
                );
              })}
              <a
                href={`${hrefFor('/')}#social`}
                className="flex items-center gap-3 text-sm text-white/65 transition hover:text-white"
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: '#C13584' }}
                >
                  <IconInstagram className="h-3.5 w-3.5 text-white" />
                </span>
                {t('instagram')}
              </a>
              <Link
                href={hrefFor(links.prayerClock)}
                className="flex items-center gap-3 text-sm text-white/65 transition hover:text-white"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <IconPrayer className="h-3.5 w-3.5" />
                </span>
                {t('prayerBoard')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/[0.08]">
        <div className="container-ist flex flex-col items-center justify-between gap-2 py-4 sm:flex-row">
          <p className="text-xs text-white/35">
            © {new Date().getFullYear()} {site.name}. {t('rights')}
          </p>
          <Link href={hrefFor('/privacy')} className="text-xs text-white/35 transition hover:text-white/65">
            Privacy policy
          </Link>
          <Link href="/admin/login" className="text-xs text-white/25 transition hover:text-white/55">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}

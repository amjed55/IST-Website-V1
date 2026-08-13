import type { Metadata } from 'next';
import { Cormorant_Garamond, Noto_Naskh_Arabic, Outfit } from 'next/font/google';
import { headers } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StickyPrayerBar } from '@/components/StickyPrayerBar';
import { ScrollProgress } from '@/components/motion';
import { site } from '@/lib/content';
import { loadMessages } from '@/i18n/messages';
import { defaultLocale, isAppLocale, rtlLocales } from '@/i18n/routing';

const displayFont = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const sansFont = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const arabicFont = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
});

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.islamicsocietyoftoronto.com',
);

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: `${site.name} | ${site.masjid}`,
    template: `%s | ${site.shortName}`,
  },
  description:
    'Islamic Society of Toronto (Masjid Darus Salaam) at 20 Overlea Blvd — prayer times, education, community programs, and services.',
  applicationName: site.name,
  alternates: { canonical: '/' },
  icons: {
    icon: '/brand/ist-mark.svg',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: site.name,
    description: site.tagline,
    url: '/',
    siteName: site.name,
    locale: 'en_CA',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.name,
    description: site.tagline,
    images: ['/opengraph-image'],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const requestedLocale = (await headers()).get('x-ist-locale');
  const locale = isAppLocale(requestedLocale) ? requestedLocale : defaultLocale;
  const messages = await loadMessages(locale);
  const mosqueJsonLd = {
    '@context': 'https://schema.org',
    '@type': ['Mosque', 'PlaceOfWorship'],
    name: `${site.name} — ${site.masjid}`,
    alternateName: site.masjid,
    url: siteUrl.toString(),
    telephone: site.phone,
    email: site.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '20 Overlea Blvd',
      addressLocality: 'Toronto',
      addressRegion: 'ON',
      postalCode: 'M4H 1A4',
      addressCountry: 'CA',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 43.7056,
      longitude: -79.3444,
    },
    sameAs: ['https://www.instagram.com/islamicsocietyoftoronto'],
  };

  return (
    <html lang={locale} dir={rtlLocales.has(locale) ? 'rtl' : 'ltr'}>
      <body
        className={`${displayFont.variable} ${sansFont.variable} ${arabicFont.variable} pattern-mesh ${
          rtlLocales.has(locale) ? 'font-arabic' : ''
        }`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(mosqueJsonLd).replace(/</g, '\\u003c'),
            }}
          />
          <a
            href="#main-content"
            className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-ist-gold px-4 py-2 text-sm font-semibold text-ist-green-deep transition focus:translate-y-0"
          >
            Skip to main content
          </a>
          <noscript>
            <style>{`[data-reveal],.route-enter{opacity:1!important;transform:none!important}`}</style>
          </noscript>
          <ScrollProgress />
          <Header />
          <main
            id="main-content"
            className="min-h-[70vh] pb-[calc(var(--prayer-bar-h,0px)+1rem)]"
          >
            {children}
          </main>
          <Footer />
          <StickyPrayerBar />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

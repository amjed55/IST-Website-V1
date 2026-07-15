import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileCtaBar } from '@/components/MobileCtaBar';
import { StickyPrayerBar } from '@/components/StickyPrayerBar';
import { ScrollProgress } from '@/components/motion';
import { site } from '@/lib/content';

export const metadata: Metadata = {
  title: {
    default: `${site.name} | ${site.masjid}`,
    template: `%s | ${site.shortName}`,
  },
  description:
    'Islamic Society of Toronto (Masjid Darus Salaam) at 20 Overlea Blvd — prayer times, education, community programs, and services.',
  openGraph: {
    title: site.name,
    description: site.tagline,
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="pattern-mesh">
        <noscript>
          <style>{`[data-reveal],.route-enter{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <ScrollProgress />
        <Header />
        <main className="min-h-[70vh] pb-[calc(var(--mobile-cta-h,0px)+var(--prayer-bar-h,0px)+1rem)] lg:pb-[calc(var(--prayer-bar-h,0px)+1rem)]">
          {children}
        </main>
        <Footer />
        <StickyPrayerBar />
        <MobileCtaBar />
      </body>
    </html>
  );
}

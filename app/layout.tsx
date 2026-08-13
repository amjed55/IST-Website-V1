import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
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
      </body>
    </html>
  );
}

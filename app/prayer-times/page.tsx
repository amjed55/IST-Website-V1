import type { Metadata } from 'next';
import { images } from '@/lib/images';
import { Section } from '@/components/ui';
import { FadeIn, PageTransition } from '@/components/motion';
import { PageHero } from '@/components/PageHero';
import { PrayerEmbed } from '@/components/PrayerEmbed';
import { JummahSchedule } from '@/components/JummahSchedule';

export const metadata: Metadata = { title: 'Prayer Times' };

export default function PrayerTimesPage() {
  return (
    <PageTransition>
      <PageHero
        compact
        image={images.services}
        eyebrow="Salah board"
        title="Prayer Times"
        description="Native Classic Prayer Clock board — live times from IST’s central clock. Iqamah also stays in the bar at the bottom of every page."
      />

      <Section className="!pt-8 sm:!pt-10">
        <JummahSchedule />
      </Section>

      <Section className="section-band !py-14 sm:!py-16">
        <FadeIn>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ist-teal">
            Live board
          </p>
          <h2 className="mt-2 font-display text-3xl text-ist-green sm:text-4xl">
            Full prayer clock
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-ist-muted">
            Same Classic layout used on masjid TVs — built natively on this page, not an iframe.
          </p>
        </FadeIn>
        <FadeIn delay={0.08} className="mt-8">
          <PrayerEmbed />
        </FadeIn>
      </Section>
    </PageTransition>
  );
}

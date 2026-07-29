import type { Metadata } from 'next';
import { images } from '@/lib/images';
import { Section } from '@/components/ui';
import { FadeUp, PageTransition } from '@/components/motion';
import { SiteForm } from '@/components/SiteForm';
import { PageHero } from '@/components/PageHero';
import { EventsBoard } from '@/components/EventsBoard';

export const metadata: Metadata = { title: 'Events' };

export default function EventsPage() {
  return (
    <PageTransition>
      <PageHero
        compact
        image={images.events}
        eyebrow="Events"
        title="Events &amp; announcements"
        description="Browse the carousel for upcoming programmes, or open Past for greyed finished events."
      />

      <Section>
        <EventsBoard showHeader={false} />

        <FadeUp delay={0.1} className="mt-14 border-t border-ist-green/8 pt-14">
          <span className="eyebrow">Inquiries</span>
          <h2 className="mt-4 font-display text-3xl text-ist-green">Submit an enquiry</h2>
          <p className="mt-2 text-ist-ink/60">
            Have a question about an event or announcement? Send us a message and we will get back to you.
          </p>
          <div className="mt-8 max-w-xl">
            <SiteForm type="event-inquiry" submitLabel="Send inquiry" />
          </div>
        </FadeUp>
      </Section>
    </PageTransition>
  );
}

import type { Metadata } from 'next';
import { images } from '@/lib/images';
import { Section } from '@/components/ui';
import { PageTransition } from '@/components/motion';
import { SiteForm } from '@/components/SiteForm';
import { PageHero } from '@/components/PageHero';
import { EventsBoard } from '@/components/EventsBoard';
import { CalendarView } from '@/components/CalendarView';

export const metadata: Metadata = {
  title: 'Events & Programs',
  description:
    'Browse and subscribe to the Islamic Society of Toronto calendar for community events, classes, and recurring programs.',
};

export default function EventsPage() {
  return (
    <PageTransition>
      <PageHero
        compact
        image={images.events}
        eyebrow="Events"
        title="Events & programmes"
        description="Browse the community calendar, filter events and programmes, or subscribe from your own calendar app."
      />

      <Section>
        <CalendarView />
      </Section>

      <Section className="!pt-0">
        <span className="eyebrow">Featured</span>
        <h2 className="mt-4 font-display text-3xl text-ist-green">Highlights &amp; past events</h2>
        <div className="mt-6">
          <EventsBoard showHeader={false} />
        </div>
      </Section>

      <Section className="!pt-0">
        <span className="eyebrow">Inquiries</span>
        <h2 className="mt-4 font-display text-3xl text-ist-green">Submit an enquiry</h2>
        <p className="mt-2 text-ist-ink/60">
          Have a question about an event or announcement? Send us a message and we will get back to you.
        </p>
        <div className="mt-8 max-w-xl">
          <SiteForm type="event-inquiry" submitLabel="Send inquiry" />
        </div>
      </Section>
    </PageTransition>
  );
}

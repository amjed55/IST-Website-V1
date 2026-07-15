import type { Metadata } from 'next';
import Image from 'next/image';
import { events } from '@/lib/content';
import { images } from '@/lib/images';
import { Badge, Section } from '@/components/ui';
import { FadeUp, PageTransition, Stagger, StaggerItem } from '@/components/motion';
import { SiteForm } from '@/components/SiteForm';
import { PageHero } from '@/components/PageHero';

export const metadata: Metadata = { title: 'Events' };

export default function EventsPage() {
  return (
    <PageTransition>
      <PageHero
        compact
        image={images.events}
        eyebrow="Events"
        title="Events &amp; announcements"
        description="Stay informed about weekly programmes, community announcements, and upcoming gatherings at IST."
      />

      <Section>
        <Stagger className="divide-y divide-ist-green/8">
          {events.map((e) => {
            const thumb = images.eventsById[e.id] || images.events;
            return (
              <StaggerItem key={e.id}>
                <article id={e.id} className="grid gap-6 py-8 md:grid-cols-[180px_1fr]">
                  {/* Date card */}
                  <div className="relative hidden aspect-square overflow-hidden md:block">
                    <Image
                      src={thumb.src}
                      alt={thumb.alt}
                      fill
                      className="object-cover"
                      sizes="180px"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ist-green-deep/95 to-transparent px-3 pb-3 pt-6">
                      <p className="font-display text-lg leading-tight text-white">{e.dateLabel}</p>
                    </div>
                  </div>

                  {/* Body */}
                  <div>
                    {e.badge && <Badge className="mb-3">{e.badge}</Badge>}
                    <h2 className="font-display text-2xl text-ist-green sm:text-3xl">{e.title}</h2>
                    {/* Mobile date */}
                    <p className="mt-1 text-sm font-medium text-ist-teal md:hidden">{e.dateLabel}</p>
                    <p className="mt-3 leading-relaxed text-ist-ink/65">{e.summary}</p>
                    {e.location && (
                      <p className="mt-2 flex items-center gap-1.5 text-sm text-ist-teal">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                          <path d="M7 1a4 4 0 0 1 4 4c0 3-4 8-4 8S3 8 3 5a4 4 0 0 1 4-4z" stroke="currentColor" strokeWidth="1.25" />
                          <circle cx="7" cy="5" r="1.25" stroke="currentColor" strokeWidth="1.25" />
                        </svg>
                        {e.location}
                      </p>
                    )}
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>

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

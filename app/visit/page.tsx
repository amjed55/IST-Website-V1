import type { Metadata } from 'next';
import { links, site } from '@/lib/content';
import { images } from '@/lib/images';
import { Button, Section } from '@/components/ui';
import { FadeUp, PageTransition, SlideInLeft, SlideInRight } from '@/components/motion';
import { PageHero } from '@/components/PageHero';
import { MediaBand } from '@/components/MediaBand';

export const metadata: Metadata = { title: 'Visit & Parking' };

const encodedAddress = encodeURIComponent(site.address);

export default function VisitPage() {
  return (
    <PageTransition>
      <PageHero
        compact
        image={images.visit}
        eyebrow="Plan your visit"
        title="Find us at Masjid Darus Salaam"
        description="Everything you need before you arrive — directions, parking guidance, and what to expect at 20 Overlea Blvd."
        actions={
          <>
            <Button href="/prayer-times" variant="teal">
              Prayer times
            </Button>
            <Button href="/contact" variant="light">
              Contact
            </Button>
          </>
        }
      />

      <Section>
        {/* Parking warning */}
        <FadeUp>
          <div className="border-l-4 border-ist-gold bg-ist-gold/10 px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ist-green">
              Important parking notice
            </p>
            <h2 className="mt-2 font-display text-2xl text-ist-green sm:text-3xl">
              Do not park at the following locations
            </h2>
            <ul className="mt-3 space-y-1.5 text-ist-ink/80">
              <li className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 shrink-0 text-ist-gold">✕</span>
                <span><strong>25 Overlea Blvd</strong> — the strip plaza directly across the street</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 shrink-0 text-ist-gold">✕</span>
                <span><strong>East York Town Centre</strong> — the adjacent mall parking lot</span>
              </li>
            </ul>
            <p className="mt-3 text-sm text-ist-ink/55">
              Both lots are privately managed and actively enforce — vehicles will be towed at the owner's expense.
            </p>
          </div>
        </FadeUp>

        <FadeUp delay={0.05} className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Before Friday prayer',
                body: 'Jummah is the busiest visit. Arrive early and check the live prayer board for current congregation times.',
              },
              {
                title: 'Brothers, sisters & families',
                body: 'Everyone is welcome. Follow on-site signs for the appropriate prayer areas, and ask a volunteer if you are unsure.',
              },
              {
                title: 'Wudu & dress',
                body: 'Come in modest, clean clothing. Wudu before arrival can make a first visit easier; please silence phones in the prayer hall.',
              },
              {
                title: 'Accessibility questions',
                body: 'Contact the office before travelling to confirm the best current entrance or accommodation for your needs.',
              },
            ].map((item) => (
              <article
                key={item.title}
                className="border border-ist-green/10 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-lift"
              >
                <h2 className="font-display text-2xl text-ist-green">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ist-ink/65">{item.body}</p>
              </article>
            ))}
          </div>
          <div className="mt-4 border border-ist-green/10 bg-ist-cream-dark/40 p-5">
            <h2 className="font-display text-2xl text-ist-green">Driving, parking & transit</h2>
            <p className="mt-2 text-sm leading-relaxed text-ist-ink/65">
              On-site capacity changes with programmes and Friday attendance. Do not use the two
              private lots listed above. If you need an approved parking location, call the office
              before travelling. For transit, plan a current TTC trip to 20 Overlea Blvd.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`}
                variant="teal"
                external
              >
                Google Maps
              </Button>
              <Button
                href={`https://maps.apple.com/?daddr=${encodedAddress}`}
                variant="outline"
                external
              >
                Apple Maps
              </Button>
              <Button href={site.phoneHref} variant="outline">
                Call the office
              </Button>
            </div>
          </div>
        </FadeUp>

        {/* Info band */}
        <div className="mt-10">
          <MediaBand image={images.about} eyebrow="Arrival" title="Address & what to expect">
            <p className="text-ist-ink/70">{site.address}</p>
            <p className="text-sm text-ist-ink/60">
              Serving Thorncliffe Park, Flemingdon Park, and the wider East Toronto area.
            </p>
            <ul className="mt-1 space-y-1.5 text-sm text-ist-ink/65">
              <li>Five daily prayers and Jummah congregations every Friday</li>
              <li>Open to brothers, sisters, families, and youth</li>
              <li>Please dress modestly and silence phones inside the prayer hall</li>
              <li>Nikah ceremonies available; gym is not currently for rental</li>
            </ul>
            <div className="flex flex-wrap gap-3 pt-3">
              <Button href={links.whatsapp} variant="teal" external>
                WhatsApp updates
              </Button>
              <Button href={links.donate} variant="gold" external>
                Donate
              </Button>
            </div>
          </MediaBand>
        </div>

        {/* Map */}
        <FadeUp delay={0.08} className="mt-10 overflow-hidden border border-ist-green/8">
          <iframe
            title="Directions map"
            src={site.mapEmbed}
            className="h-[360px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </FadeUp>
      </Section>
    </PageTransition>
  );
}

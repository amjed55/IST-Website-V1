import type { Metadata } from 'next';
import { links, site } from '@/lib/content';
import { images } from '@/lib/images';
import { Button, Section } from '@/components/ui';
import { FadeUp, PageTransition, SlideInLeft, SlideInRight } from '@/components/motion';
import { PageHero } from '@/components/PageHero';
import { MediaBand } from '@/components/MediaBand';

export const metadata: Metadata = { title: 'Visit & Parking' };

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
          />
        </FadeUp>
      </Section>
    </PageTransition>
  );
}

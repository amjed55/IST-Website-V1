import type { Metadata } from 'next';
import Link from 'next/link';
import { servicesSubsections } from '@/lib/subsections';
import { images } from '@/lib/images';
import { Badge, Section } from '@/components/ui';
import { FadeUp, PageTransition, Stagger, StaggerItem } from '@/components/motion';
import { PageHero } from '@/components/PageHero';

export const metadata: Metadata = { title: 'Life Services' };

export default function ServicesPage() {
  return (
    <PageTransition>
      <PageHero
        compact
        image={images.services}
        eyebrow="Life Services"
        title="Pastoral &amp; Life Services"
        description="Nikah ceremonies, marriage counselling, and Janazah care — each conducted by qualified scholars according to Islamic principles."
      />

      <Section>
        <Stagger staggerDelay={0.07} className="divide-y divide-ist-green/8">
          {servicesSubsections.map((page) => (
            <StaggerItem key={page.slug}>
              <Link
                href={`/services/${page.slug}`}
                className="group flex flex-col gap-1 py-7 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {page.comingSoon && (
                      <Badge className="bg-ist-gold/15 text-ist-green">Coming soon</Badge>
                    )}
                  </div>
                  <h2 className="mt-1 font-display text-2xl text-ist-green transition-colors group-hover:text-ist-teal">
                    {page.title}
                  </h2>
                  <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ist-ink/60">
                    {page.description}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-ist-teal">View details →</span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>

        <FadeUp className="mt-10 border-t border-ist-green/8 pt-8">
          <p className="text-sm font-semibold text-ist-green">Gym & hall availability</p>
          <p className="mt-1 text-sm text-ist-ink/60">
            The gym facility is currently <strong className="text-ist-ink">not available for rental</strong>. Please contact the office for any future availability enquiries.
          </p>
        </FadeUp>
      </Section>
    </PageTransition>
  );
}
